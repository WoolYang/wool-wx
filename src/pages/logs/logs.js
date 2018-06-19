import { formatTime } from '../../utils/util.js'

export default class Logs extends Page {

  constructor() {
    super()
    this.state = {
      logs: []
    }
  }

  onLoad() {
    this.setState({
      logs: (wxx.getStorageSync('logs') || []).map(log => {
        return formatTime(new Date(log))
      })
    })
  }

  render() {
    return (
      <View className="container log-list">
        <Block for={logs} for-item="log">
          <Text className="log-item">{index + 1}. {log}</Text>
        </Block>
      </View>
    )
  }
}