export default class ComponentDemo extends Component {
    constructor() {
        super()
        this.state = {
            test: 'state'
        }
    }

    static propTypes = {
        a: PropTypes.string,
        b: PropTypes.number,
        c: PropTypes.string
    }
    static defaultProps = {
        a: '',
        b: '默认值',
        c: ''
    }

    myButtonTap(event) {
        this.setState({ a: '我被改变了' })
    }

    myButtonTap1(event) {
        this.triggerEvent('change')
    }

    _myPrivateButtonTap(event) {
        this.replaceDataOnPath(['test'], '我被改变了')
        this.applyDataUpdates()
    }

    render() {
        return (
            <View className="wrapper">
                <Slot></Slot>
                <View>我是组件的内部节点</View>
                <View>我是默认值：{b}</View>
                <View>我是父组件的的props:{a}</View>
                <Button onTap={myButtonTap} >点我改变组件内传入值</Button>
                <Button onTap={myButtonTap1} >点我改变组件外传入值</Button>
                <View>我是子组件state:{test}</View>
                <Button onTap={_myPrivateButtonTap} >点我改变子组件state</Button>
            </View>
        )
    }
}
