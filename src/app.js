import './pages/index/index.js';
import './pages/logs/logs.js';
export default class Index extends App {

    globalData = {
        userInfo: null
    }

    onLaunch() {
        // 展示本地存储能力
        var logs = wxx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wxx.setStorageSync('logs', logs)

        wxx.login().then(res => {
            console.log(res)
        })
    }
}