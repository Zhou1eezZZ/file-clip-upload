import Axios from 'axios'
import Config from '../config'
import { getToken } from '../utils/auth'
// import { isArray, isObject } from '../utils/types'

const { devUrl, proUrl, timeout } = Config.server

Axios.defaults.timeout = timeout
Axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? devUrl : proUrl
Axios.defaults.headers = {
    'Content-Type': 'application/json'
}

Axios.interceptors.request.use(
    config => {
        const token = getToken()
        token && (config.headers['Authorization'] = token)

        return config
    },
    error => {
        return Promise.reject(error)
    }
)

Axios.interceptors.response.use(
    response => {
        return response
    },
    error => {
        return Promise.reject(error)
    }
)

// const transformRequest = data => {
//     const transformData = {}

//     Object.keys(data).forEach(key => {
//         const dataItem = data[key]
//         transformData[key] =
//             isArray(dataItem) || isObject(dataItem) ? JSON.stringify(dataItem) : dataItem
//     })

//     return transformData
// }

export default ({ method, url, params, data, config }) => {
    return new Promise((resolve, reject) => {
        Axios({
            method,
            url,
            params: params ? params : {},
            data: data ? data : {},
            // transformRequest,
            ...config
        })
            .then(response => {
                resolve(response.data)
            })
            .catch(error => {
                reject(error)
            })
    })
}
