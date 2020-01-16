<template>
    <div id="app">
        <div class="container">
            <h1>file-clip</h1>
            <el-upload ref="upload" action="#" :before-upload="beforeUpload">
                <el-button
                    slot="trigger"
                    size="small"
                    type="primary"
                    :disabled="file && !hash ? true : false"
                    >选择文件</el-button
                >
                <el-button
                    v-if="file"
                    style="margin-left:20px"
                    size="small"
                    type="success"
                    @click="submitUpload"
                    :disabled="hash ? false : true"
                    >上传</el-button
                >
                <el-button
                    v-if="file && hash"
                    style="margin-left:20px"
                    size="small"
                    type="danger"
                    @click="resetFile"
                    >重置</el-button
                >
            </el-upload>
            <div v-if="file" class="file-tip">
                <p>文件名:{{ file.name }}</p>
                <p>文件大小:{{ (file.size / 1024).toFixed(2) }} kb</p>
                <p>文件hash:{{ hash ? hash : '生成文件hash中...' }}</p>
                <el-progress
                    style="margin-top:20px"
                    :text-inside="true"
                    :stroke-width="26"
                    :percentage="percentage"
                ></el-progress>
            </div>
        </div>
    </div>
</template>

<script>
import { uploadFile, mergeFile, verifyFile } from './api/upload'

const CLIP_SIZE = 1024 * 1024 * 2 // 最小切片的大小

export default {
    data() {
        return {
            file: null,
            worker: null, // web-worker
            hash: '',
            clipPercentage: {},
            hashPercentage: 0, // 界面中并未可视化展示
            fileChunkList: [],
            secondlyUpload: false
        }
    },
    watch: {
        async file(val) {
            if (val) {
                this.clipPercentage = {}
                this.hash = ''
                this.fileChunkList = []
                this.secondlyUpload = false
                const fileChunkList = this.createFileChunk(val)
                this.fileChunkList = fileChunkList
                this.hash = await this.calculateHash(fileChunkList)
            }
        }
    },
    computed: {
        percentage() {
            if (this.secondlyUpload) return 100
            const keys = Object.keys(this.clipPercentage)
            if (this.file && keys.length > 0) {
                let loaded = 0
                keys.forEach(key => (loaded += this.clipPercentage[key].loaded))
                const percentage = parseInt((loaded / this.file.size) * 100)
                return percentage > 100 ? 100 : percentage
            }
            return 0
        }
    },
    methods: {
        // 重置按钮
        resetFile() {
            this.file = null
            this.worker = null
            this.hash = ''
            this.clipPercentage = {}
            this.hashPercentage = 0
            this.fileChunkList = []
            this.secondlyUpload = false
        },
        beforeUpload(file) {
            this.file = file
            return false
        },
        // 生成文件切片
        createFileChunk(file, chunkSize = CLIP_SIZE) {
            const fileChunkList = []
            const length = Math.ceil(file.size / chunkSize)
            for (let i = 0; i < length; i++) {
                fileChunkList.push({
                    file: file.slice(i * chunkSize, i !== length ? (i + 1) * chunkSize : file.size),
                    hash: file.name + '-' + i
                })
            }
            return fileChunkList
        },
        async submitUpload() {
            try {
                if (!this.file || this.fileChunkList.length === 0) return
                // 确认文件是否可以秒传
                const { shouldUpload } = await verifyFile(this.file.name, this.hash)
                if (shouldUpload) {
                    this.uploadFileList(this.fileChunkList)
                } else {
                    this.secondlyUpload = true
                    this.$message.success('文件秒传成功！')
                }
            } catch (error) {
                console.log(error)
                this.$message.error('文件上传失败')
            }
        },
        async uploadFileList(fileList) {
            try {
                const requestList = fileList
                    .map(file => {
                        const formData = new FormData()
                        formData.append('chunk', file.file)
                        formData.append('hash', file.hash)
                        formData.append('name', this.file.name)
                        return formData
                    })
                    .map(async (formData, index) =>
                        uploadFile(formData, e => {
                            const { loaded, total } = e
                            this.$set(this.clipPercentage, index, { loaded, total })
                        })
                    )
                // 并发切片
                await Promise.all(requestList)
                // 合并切片
                this.mergeRequest(this.file.name, this.hash)
            } catch (error) {
                this.$message.error('上传出错')
                console.log(error)
            }
        },
        async mergeRequest(fileName, hash) {
            try {
                await mergeFile(fileName, hash)
                this.$message.success('文件上传成功')
            } catch (error) {
                console.log(error)
            }
        },
        // 生成上传文件的hash (web-worker)
        calculateHash(fileChunkList) {
            return new Promise(resolve => {
                // 添加 worker 属性
                this.worker = new Worker('/hash.js')
                this.worker.postMessage({ fileChunkList })
                this.worker.onmessage = e => {
                    const { percentage, hash } = e.data
                    this.hashPercentage = percentage
                    hash && resolve(hash)
                }
            })
        }
    }
}
</script>

<style lang="scss">
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    // text-align: center;
    color: #2c3e50;
    .container {
        padding: 0 30px;
        h1 {
            font-size: 30px;
            line-height: 50px;
        }
        .file-tip {
            margin-top: 20px;
        }
    }
}
</style>
