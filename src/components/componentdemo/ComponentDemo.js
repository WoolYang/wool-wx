export default class ComponentDemo extends Component {
    constructor() {
        super()
        this.state = {
            data: {
                motto: 'Hello World!!',
                userInfo: {},
                hasUserInfo: false,
            }
        }
    }

    render() {
        return (
            <View>
                <Slot></Slot>
            </View>
        )
    }
}
