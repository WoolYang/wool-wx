import { Page } from '../../../tools/base.js';

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

    onLoad() {
        console.log(111)
    }

    getUserInfo(e) {
        console.log(e)
        // app.globalData.userInfo = e.detail.userInfo
        this.setState({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    }

    render() {
        return (
            <view class="container test">
                <view class="userinfo">
                    <button open-type="getUserInfo" bindgetuserinfo="getUserInfo">获取头像昵称</button>
                    <block>
                        <image bindtap="bindViewTap" class="userinfo-avatar" src={userInfo.avatarUrl} mode="cover"></image>
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