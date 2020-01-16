import Axios from 'axios'
import Config from '../config'

const { devUrl, proUrl, timeout } = Config.server

Axios.defaults.timeout = timeout
Axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? devUrl : proUrl
Axios.defaults.headers = {
    'Content-Type': 'application/json'
}

Axios.interceptors.request.use(
    config => {
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

export default ({ method, url, params, data, config }) => {
    return new Promise((resolve, reject) => {
        Axios({
            method,
            url,
            params: params ? params : {},
            data: data ? data : {},
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
