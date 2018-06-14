export default class Header extends Component {
    render() {
        return (
            <view class="header">
                <view>这里是组件的内部节点</view>
                <slot></slot>
            </view>
        )
    }
}
