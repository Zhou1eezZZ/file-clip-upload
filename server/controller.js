const multiparty = require('multiparty')
const path = require('path')
const fse = require('fs-extra')

const UPLOAD_DIR = path.resolve(__dirname, '..', 'target')

// 请求参数解析函数?
const resolvePost = req =>
    new Promise(resolve => {
        let chunk = ''
        req.on('data', data => {
            chunk += data
        })
        req.on('end', () => {
            resolve(JSON.parse(chunk))
        })
    })

const mergeFileChunk = async (filePath, fileName, fileHash) => {
    try {
        const ext = extractExt(fileName)
        const resultPath = `${UPLOAD_DIR}/${fileHash}${ext}`
        // 获取clip文件夹下所有clip的文件名
        const chunkPaths = await fse.readdir(filePath)
        // 初始化切片合成文件（初始化为空）
        await fse.writeFile(resultPath, '')

        chunkPaths.forEach(async chunkPath => {
            // 遍历clip数组向合成文件中添加每一个切片
            fse.appendFileSync(resultPath, fse.readFileSync(`${filePath}/${chunkPath}`))
            // 删除切片
            fse.unlinkSync(`${filePath}/${chunkPath}`)
        })
        // 删除切片目录
        fse.rmdirSync(filePath)
    } catch (error) {
        console.log(error)
    }
}

// 提取文件的后缀名
const extractExt = fileName => fileName.slice(fileName.lastIndexOf('.'), fileName.length)

const handleFormData = async (req, res) => {
    const multipart = new multiparty.Form()

    // 添加一个文件的临时存放路径（默认在c盘，会报权限问题）
    // multipart.uploadDir = UPLOAD_DIR

    multipart.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err)
            res.status = 500
            res.end('process file chunk failed')
            return
        }
        const [chunk] = files.chunk
        const [hash] = fields.hash
        const [name] = fields.name
        const chunkDir = `${UPLOAD_DIR}/${name}.clip`

        // 切片目录不存在，创建切片目录
        if (!fse.existsSync(chunkDir)) {
            await fse.mkdirs(chunkDir)
        }

        // 重命名文件
        // fs-extra 专用方法，类似 fs.rename 并且跨平台
        // fs-extra 的 rename 方法 windows 平台会有权限问题
        await fse.move(chunk.path, `${chunkDir}/${hash}`)
        res.end('received file chunk')
    })
}

const handleMerge = async (req, res) => {
    const data = await resolvePost(req)
    const { fileName, fileHash } = data
    const filePath = `${UPLOAD_DIR}/${fileName}.clip`
    await mergeFileChunk(filePath, fileName, fileHash)
    res.end(JSON.stringify({ code: 0, message: 'file merged success' }))
}

const handleVerify = async (req, res) => {
    const data = await resolvePost(req)
    const { fileName, fileHash } = data
    const ext = extractExt(fileName)
    const filePath = `${UPLOAD_DIR}/${fileHash}${ext}`
    if (fse.existsSync(filePath)) {
        res.end(
            JSON.stringify({
                shouldUpload: false
            })
        )
    } else {
        res.end(
            JSON.stringify({
                shouldUpload: true
            })
        )
    }
}

module.exports = { handleFormData, handleMerge, handleVerify }
