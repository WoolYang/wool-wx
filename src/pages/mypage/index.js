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
                <view class="userinfo" >
                    <if condition={!hasUserInfo && canIUse} >
                        <button open-type="getUserInfo" bindgetuserinfo="getUserInfo">获取头像昵称</button>
                    </if>
                    <elif condition={!hasUserInfo && canIUse} >
                        <button open-type="getUserInfo" bindgetuserinfo="getUserInfo">获取头像昵称</button>
                    </elif>
                    <else>
                        <block>
                            <image bindtap="bindViewTap" class="userinfo-avatar" src={userInfo.avatarUrl} mode="cover"></image>
                            <text class="userinfo-nickname">{userInfo.nickName ? 1 : 2}</text>
                        </block>
                    </else>
                    {!hasUserInfo && canIUse ? <button open-type="getUserInfo" bindgetuserinfo="getUserInfo">条件一</button>
                        : <button open-type="getUserInfo" bindgetuserinfo="getUserInfo">条件二</button>
                    }
                </view>
                <view class="usermotto">
                    <text class="user-motto">{motto}</text>
                </view>
            </view>
        )
    }
}