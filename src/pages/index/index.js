const app = getApp()
import ComponentDemo from '../../components/componentdemo/ComponentDemo.js'
export default class Index extends Page {

    constructor() {
        super()
        this.state = {
            motto: '传入值',
            motto1: '传入值外',
            userInfo: {},
            hasUserInfo: false,
            canIUse: wx.canIUse('button.open-type.getUserInfo'),
        }
    }

    //事件处理函数
    bindViewTap() {
        wxx.navigateTo({
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
            wxx.getUserInfo().then(res => {
                app.globalData.userInfo = res.userInfo
                this.setState({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
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

    change(e) {
        this.setState({ motto1: '我被emit改变了' })
    }

    render() {
        return (
            <View className="container">
                <View className="userinfo">
                    <Button if={!hasUserInfo && canIUse} open-type="getUserInfo" onGetuserinfo={getUserInfo}>获取头像昵称</Button>
                    <Block else>
                        <Image onTap={bindViewTap} className="userinfo-avatar" src={userInfo.avatarUrl} mode="cover"></Image>
                        <Text className="userinfo-nickname">{userInfo.nickName}</Text>
                    </Block>
                </View>
                <View className="usermotto">
                    <View>我是在父组件访问传入值：{motto}</View>
                    <View>我是在父组件访问传入值：{motto1}</View>
                    <ComponentDemo a={motto} c={motto1} onTap={change} >
                        <View>我是插入到组件slot中的内容</View>
                    </ComponentDemo>
                </View>
            </View>
        )
    }
}