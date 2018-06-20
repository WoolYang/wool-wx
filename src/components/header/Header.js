export default class Header extends Component {
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
            <View className="header">
                <Slot></Slot>
            </View>
        )
    }
}
