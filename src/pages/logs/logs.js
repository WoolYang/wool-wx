import { formatTime } from '../../utils/util.js'
//import { default as wx } from '../../utils/wx.js'
export default class Logs extends Page {

  constructor() {
    super()
    this.state = {
      logs: []
    }
  }

  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return formatTime(new Date(log))
      })
    })
  }

  render() {
    return (
      <view class="container log-list">
        <block for={logs} for-item="log">
          <text class="log-item">{index + 1}. {log}</text>
        </block>
      </view>
    )
  }
}