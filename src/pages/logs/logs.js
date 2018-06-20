import { formatTime } from '../../utils/util.js'
import Log from '../../templates/logs/Log.js'
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
        <Log logs={logs} />
      </View>
    )
  }
}