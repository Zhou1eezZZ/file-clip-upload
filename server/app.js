const http = require('http')

const server = http.createServer()

const { handleFormData, handleMerge, handleVerify } = require('./controller')

server.on('request', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    if (req.method === 'OPTIONS') {
        res.status = 200
        res.end()
        return
    }

    if (req.url === '/') {
        await handleFormData(req, res)
    }

    if (req.url === '/merge') {
        await handleMerge(req, res)
    }

    if (req.url === '/verify') {
        await handleVerify(req, res)
    }
})

server.listen(3000, () => console.log('正在监听 3000 端口🐷'))
