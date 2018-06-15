const app = getApp()

export default class Index extends Page {

    constructor() {
        super()
        this.state = {
            motto: 'Hello World',
            userInfo: {},
            hasUserInfo: false,
            canIUse: wx.canIUse('button.open-type.getUserInfo')
        }
    }

    //事件处理函数
    bindViewTap() {
        wx.navigateTo({
            url: '../logs/logs'
        })
    }

    onLoad() {
        if (app.globalData.userInfo) {
            this.setState({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.state.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setState({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setState({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }
    }

    getUserInfo(e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setState({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    }

    render() {
        return (
            <view class="container">
                <view class="userinfo">
                    <button if={!hasUserInfo && canIUse} open-type="getUserInfo" onGetuserinfo={getUserInfo}> 获取头像昵称 </button>
                    <block else>
                        <image onTap={bindViewTap} class="userinfo-avatar" src={userInfo.avatarUrl} mode="cover"></image>
                        <text class="userinfo-nickname">{userInfo.nickName}</text>
                    </block>
                </view>
                <view class="usermotto">
                    <text class="user-motto">{motto}</text>
                </view>
            </view>
        )
    }
}