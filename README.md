# wool-wx

<p align="center">
<a href="https://travis-ci.org/WoolYang/wool-wx">
  <img src="https://travis-ci.org/WoolYang/wool-wx.svg?branch=master" alt="Travis CI Status"/></a>
</p> 

react语法糖转化为原生微信小程序

## 安装
```js
    npm install
```

## 运行
```js
    npm run dev
```

## 使用
    在src目录中书写代码，保存后自动化编译于dist目录，使用微信开发者工具打开dist目录并调试
### 1.规则
    注册程序，页面，组件分别继承自父类 App，Page，Component
```js
    //注册程序
    export default class Index extends App {}
    //页面
    export default class Index extends Page {}
    //组件
    export default class Index extends Component {}
```
### 2.JSX书写WXML模板
    JSX书写于类方法render中的return中，render方法中仅支持JSX模板书写，不能进行其他运算
```js  
    export default class Index extends Page {
        render() {
            return (
                <View className="container">
                    helloWorld！
                </View>
            )
        }
    }
```

### 3.JSX语法书写WXML模板表达式
    按照JSX语法对接WXML语法，组件名称大写，className替代class 事件以on开头，驼峰写法
```js
    <View className="userinfo">
        <Button if={!hasUserInfo && canIUse} open-type="getUserInfo" onGetuserinfo={getUserInfo}>获取头像昵称</Button>
        <Block else>
            <Image onTap={bindViewTap} className="userinfo-avatar" src={userInfo.avatarUrl} mode="cover"></Image>
            <Text className="userinfo-nickname">{userInfo.nickName}</Text>
        </Block>
    </View>
```
### 4.数据定义
    data集定义于constructor构造器中，JSX模板中直接访问，通过setState赋值
```js
    export default class Index extends Page {
        constructor() {
            super()
            this.state = {
                motto: 'Hello World!'
            }
        }

        render() {
            return (
                <View className="container">
                    {motto}
                </View>
            )
        }
    }
```
### 5.生命周期钩子及方法
    生命周期钩子按照小程序官方名称，与方法以类方法的形势书写
 ```js
    export default class Index extends Page {

        onLoad() {
            console.log(1)
        }

        render() {
            return (
                <View className="container">
                    helloWorld！
                </View>
            )
        }
    }
```   
### 6.模板引用
    模板书写于函数表达式中，通过import语法引入并使用
```js
    //templates文件中
    export default function Log() {
        return (
            <Block for={logs} for-item="log">
                <Text className="log-item">{index + 1}. {log}</Text>
            </Block>
        )
    }
    //在Index页使用
    import Log from '../../templates/logs/Log.js'

    export default class Index extends Page {

        constructor() {
            super()
            this.state = {
                logs: []
            }
        }

        onLoad() {
            console.log(1)
        }

        render() {
            return (
                <View className="container">
                    <Log logs={logs} />
                </View>
            )
        }
    }
```    

### 7.组件引用
    组件继承自父类Component,内容填充使用使用<Slot></Slot>标签，引用方式同模板引用
```js
    export default class ComponentDemo extends Component {
        render() {
            return (
                <View>
                    <Slot></Slot>
                </View>
            )
        }
    }

    import ComponentDemo from '../../components/componentdemo/ComponentDemo.js'
    ...
    render() {
        return (
            <View className="container">
                    <ComponentDemo>
                        <View>这里是插入到组件slot中的内容</View>
                    </ComponentDemo>
            </View>
        )
    }
    ...
```

### 公共函数引入
    公共函数按照ES6规范书写
### 8.样式使用
    样式使用less编译器，less语法编写，同层级同名称，无需引入，公共样式引入注册程序样式文件中

### 9.页面注册
    Page类型文件需要在注册程序App文件中引入

### 10.json文件处理
    json在目录对应层级下按照官方书写，编译时只做拷贝

### 11.API使用
    带有success，fail属性API按照promise方式书写，其余API按官方书写，API方法封装于wxx对象中，直接调用
```js
    wxx.login().then(res => {
        console.log(res)
    })
```
