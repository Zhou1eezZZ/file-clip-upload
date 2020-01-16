import Cookies from 'js-cookie'
import Config from '../config'

const { key, expires } = Config.token

export const getToken = () => {
    return Cookies.get(key)
}

export const setToken = token => {
    return Cookies.set(key, token, { expires })
}

export const removeToken = () => {
    return Cookies.remove(key)
}
