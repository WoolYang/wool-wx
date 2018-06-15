import './pages/index/index.js';
import './pages/logs/logs.js';
export default class Index extends App {

    globalData = {
        userInfo: null
    }

    onLaunch() {
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                console.log(res)
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        wx1.login().then(res => {
            console.log(res)
        })
    }
}