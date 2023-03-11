import axios from 'axios'
// import { ElLoading } from 'element-plus';
import router from '@/router'
import message from '@/utils/Message';
import cookies from 'vue-cookies'
const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8';
const contentTypeJson = 'application/json';
const contentTypeFile = 'multipart/form-data';

const request = (config) => {
    let { url, params, dataType, showLoading=true } = config
    // 是否有传入dataType,没有则默认为form
    dataType = dataType ? dataType : 'form'

    let contentType = contentTypeForm
    if (dataType === 'json') {
        contentType = contentTypeJson
    } else if (dataType === 'file') {
        contentType = contentTypeFile
        let param = new FormData()
        for (let key in params) {
            param.append(key, params[key])
        }
        params = param
    }

    const instance = axios.create({
        baseURL: '/api',
        timeout: 10 * 1000,
        headers: {
            'Content-Type': contentType,
            'X-Requested-With': "XMLHttpRequest",
        },
    })

    let loading = null;
    // 请求拦截
    instance.interceptors.request.use(
        (config) => {
            if (showLoading) {
                loading = ElLoading.service({
                    lock: true,
                    text: "加载中...",
                    background: 'rgba(0,0,0,0.7)',
                })
            }
            return config
        },
        (error) => {
            if (showLoading && loading) {
                loading.close()
            }
            return Promise.reject('发送请求失败')
        }
    )

    // 响应拦截
    instance.interceptors.response.use(
        (response) => {
            if (showLoading && loading) {
                loading.close()
            }
            const responseData = response.data;
            if (responseData.status === 'error') {
                if (config.errorCallback) {
                    config.errorCallback()
                }
                if (responseData.code === 901) {
                    setTimeout(() => {
                        // cookies.remove('loginInfo')
                        cookies.remove('userInfo')
                        router.replace('/login')
                    }, 2000)
                    return Promise.reject('登录超时')
                }
                return Promise.reject(responseData.info)
            }

            return responseData
        },
        (error) => {
            if (showLoading && loading) {
                loading.close()
            }
            return Promise.reject('网络异常')
        }
    )

    return instance.post(url, params).catch(err => {
        message.error(err)
    })

}
export default request;