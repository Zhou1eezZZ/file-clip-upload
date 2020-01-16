<template>
    <div id="app">
        <div class="container">
            <h1 class="logo">FileClip.</h1>
            <transition name="fade">
                <div v-show="isEnter">
                    <el-upload ref="upload" action="#" :before-upload="beforeUpload">
                        <el-button
                            v-show="!file"
                            slot="trigger"
                            size="small"
                            type="primary"
                            :disabled="file && !hash ? true : false"
                            >Choose File</el-button
                        >
                        <el-button
                            v-if="file"
                            size="small"
                            type="success"
                            @click="submitUpload"
                            :disabled="hash ? false : true"
                            >Upload</el-button
                        >
                        <el-button
                            v-if="file"
                            style="margin-left:20px"
                            size="small"
                            type="danger"
                            @click="resetFile"
                            :disabled="hash ? false : true"
                            >Reset</el-button
                        >
                    </el-upload>
                    <transition name="fade">
                        <div v-if="file" class="file-tip">
                            <p>FileName:{{ file.name }}</p>
                            <p>FileSize:{{ fileSize }}</p>
                            <p>FileHash:{{ hash ? hash : 'Generating file hash...' }}</p>
                            <el-progress
                                style="margin-top:20px"
                                :text-inside="true"
                                :stroke-width="26"
                                :percentage="percentage"
                            ></el-progress>
                        </div>
                    </transition>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { uploadFile, mergeFile, verifyFile } from './api/upload'
import { calculateFileSize } from './utils/tool'

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
            secondlyUpload: false,
            isEnter: false
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
        },
        fileSize() {
            return calculateFileSize(this.file.size)
        }
    },
    mounted() {
        setTimeout(() => {
            this.isEnter = true
        }, 1500)
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
                    this.$message.success('Ohh, Upload secondly!')
                }
            } catch (error) {
                console.log(error)
                this.$message.error('Upload failed.')
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
                this.$message.error('Upload error.')
                console.log(error)
            }
        },
        async mergeRequest(fileName, hash) {
            try {
                await mergeFile(fileName, hash)
                this.$message.success('Upload success.')
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
    text-align: center;
    color: #2c3e50;
    .container {
        font-family: 'Google-Sans';
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .logo {
            font-size: 30px;
            line-height: 50px;
            margin-bottom: 20px;
            transition: all 1s;
        }
        .file-tip {
            margin-top: 20px;
            line-height: 1.4em;
        }
    }
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
.fade-leave,
.fade-enter-to {
    opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
    transition: all 1s;
}
</style>
