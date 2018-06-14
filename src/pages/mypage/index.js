import { Page } from '../../../tools/base.js';
import tem from './templete/tem.js' //引用一个模板
import Header from './component/header/header.js' //引用一个组件
export default class Index extends Page {

    constructor() {
        super()
        this.state = {
            motto: 'Hello World',
            userInfo: {},
            hasUserInfo: false,
            canIUse: wx.canIUse('button.open-type.getUserInfo'),
            item: {
                index: 0,
                msg: 'this is a template',
                time: '2016-09-15'
            }
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
    tapName(event) {
        console.log(event)
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
                <view class="user-motto">{motto}</view>
                <view id={`item-${motto}`}> </view>
                <checkbox checked={false}> </checkbox>
                <view if={motto}> </view>
                <view hidden={flag ? true : false}> Hidden </view>
                <view> {a + b} + {c} + d</view>
                <view if={length > 6}> </view>
                <view>{"hello" + name}</view>
                <view>{object.key} {array[0]}</view>
                <template is="objectCombine" data={{ foo: a, bar: b }}></template>
                <template is="objectCombine" data={{ foo, bar }}></template>
                <template is="objectCombine" data={{ ...obj1, ...obj2, e: 5 }}></template>
                <template is="objectCombine" data={{ ...obj1, ...obj2, a, c: 6 }}></template>
                <view for={array}>
                    {index}: {item.message}
                </view>
                <view for={array} for-index="idx" for-item="itemName">
                    {idx}: {itemName.message}
                </view>
                <block for={[1, 2, 3]}>
                    <view> {index}: </view>
                    <view> {item} </view>
                </block>
                <view for="array">
                    {item}
                </view>
                <template name="msgItem">
                    <view>
                        <text> {index}: {msg} </text>
                        <text> Time: {time} </text>
                    </view>
                </template>
                <template is="msgItem" data={{ ...item }} />
                <template name="odd">
                    <view> odd </view>
                </template>
                <template name="even">
                    <view> even </view>
                </template>
                <block for={[1, 2, 3, 4, 5]}>
                    <template is={item % 2 == 0 ? 'even' : 'odd'} />
                </block>
                <view id="tapTest" data-hi="WeChat" onTap={tapName}> Click me! </view>
                <tem {...item} />
                <Header>out</Header>
            </view>
        )
    }
}