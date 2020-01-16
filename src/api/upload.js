import request from './axios'

export const uploadFile = (formData, callback) => {
    return request({
        method: 'POST',
        url: '/',
        data: formData,
        config: {
            // 使用传入的进度处理回调函数
            onUploadProgress: e => callback(e)
        }
    })
}

export const mergeFile = (fileName, fileHash) => {
    return request({
        method: 'POST',
        url: '/merge',
        data: {
            fileName,
            fileHash
        }
    })
}

export const verifyFile = (fileName, fileHash) => {
    return request({
        method: 'POST',
        url: '/verify',
        data: {
            fileName,
            fileHash
        }
    })
}
