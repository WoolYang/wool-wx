/* global wx*/
const { promisify, promisifyReturns } = require('./promisify')
const promiseAPI = `uploadFile
downloadFile
connectSocket
sendSocketMessage
closeSocket
chooseImage
previewImage
getImageInfo
saveImageToPhotosAlbum
startRecord
stopRecord
playVoice
getBackgroundAudioPlayerState
playBackgroundAudio
seekBackgroundAudio
chooseVideo
saveVideoToPhotosAlbum
loadFontFace
saveFile
getFileInfo
getSavedFileList
getSavedFileInfo
removeSavedFile
openDocument
setStorage
getStorage
getStorageInfo
removeStorage
getLocation
chooseLocation
openLocation
getSystemInfo
getNetworkType
startAccelerometer
stopAccelerometer
startCompass
stopCompass
makePhoneCall
scanCode
setClipboardData
getClipboardData
openBluetoothAdapter
closeBluetoothAdapter
getBluetoothAdapterState
startBluetoothDevicesDiscovery
stopBluetoothDevicesDiscovery
getBluetoothDevices
getConnectedBluetoothDevices
createBLEConnection
closeBLEConnection
getBLEDeviceServices
startBeaconDiscovery
stopBeaconDiscovery
getBeacons
setScreenBrightness
getScreenBrightness
setKeepScreenOn
vibrateLong
vibrateShort
addPhoneContact
getHCEState
startHCE
stopHCE
sendHCEMessage
startWifi
stopWifi
connectWifi
getWifiList
setWifiList
getConnectedWifi
showToast
showLoading
showModal
showActionSheet
setNavigationBarTitle
setNavigationBarColor
setTabBarBadge
removeTabBarBadge
showTabBarRedDot
hideTabBarRedDot
setTabBarStyle
setTabBarItem
showTabBar
hideTabBar
setBackgroundColor
setBackgroundTextStyle
setTopBarText
navigateTo
redirectTo
switchTab
navigateBack
reLaunch
startPullDownRefresh
getExtConfig
login
checkSession
authorize
getUserInfo
requestPayment
showShareMenu
hideShareMenu
updateShareMenu
getShareInfo
chooseAddress
addCard
openCard
openSetting
getSetting
getWeRunData
navigateToMiniProgram
navigateBackMiniProgram
chooseInvoiceTitle
checkIsSupportSoterAuthentication
startSoterAuthentication
checkIsSoterEnrolledInDevice
setEnableDebug
`

const noPromiseAPI = `onSocketOpen
onSocketError
onSocketClose
getRecorderManager
pauseVoice
stopVoice
pauseBackgroundAudio
stopBackgroundAudio
onBackgroundAudioPlay
onBackgroundAudioPause
onBackgroundAudioStop
getBackgroundAudioManager
createAudioContext
createInnerAudioContext
createVideoContext
createCameraContext
createLivePlayerContext
createLivePusherContext
setStorageSync
getStorageSync
getStorageInfoSync
removeStorageSync
clearStorage
clearStorageSync
createMapContext
getSystemInfoSync
canIUse
onMemoryWarning
onNetworkStatusChange
onAccelerometerChange
onCompassChange
onBluetoothAdapterStateChange
onBLECharacteristicValueChange
onBeaconUpdate
onBeaconServiceChange
onUserCaptureScreen
onHCEMessage
onGetWifiList
onWifiConnected
hideToast
hideLoading
showNavigationBarLoading
hideNavigationBarLoading
createAnimation
pageScrollTo
createCanvasContext
createContext 
drawCanvas 
canvasToTempFilePath
canvasGetImageData
canvasPutImageData
stopPullDownRefresh
createSelectorQuery
createIntersectionObserver
getExtConfigSync
getUpdateManager
createWorker
reportMonitor
reportAnalytics
`

const promisifiedWxApi = promisify(wx, {
    objectParams: true,
    exclude: [
        new RegExp(noPromiseAPI.split(/\r\n|\r|\n/).join('|'), 'gi'),
    ],
})

if (wx.createCameraContext) {
    promisifiedWxApi.createCameraContext = promisifyReturns(wx.createCameraContext.bind(wx), {
        takePhoto: { objectParams: true },
        startRecord: { objectParams: true },
        stopRecord: { objectParams: true },
    })
}

if (wx.createLivePlayerContext) {
    promisifiedWxApi.createLivePlayerContext = promisifyReturns(wx.createLivePlayerContext.bind(wx), {
        play: { objectParams: true },
        stop: { objectParams: true },
        mute: { objectParams: true },
        pause: { objectParams: true },
        resume: { objectParams: true },
        requestFullScreen: { objectParams: true },
        exitFullScreen: { objectParams: true },
    })
}

if (wx.createLivePusherContext) {
    promisifiedWxApi.createLivePusherContext = promisifyReturns(wx.createLivePusherContext.bind(wx), {
        play: { objectParams: true },
        stop: { objectParams: true },
        mute: { objectParams: true },
        pause: { objectParams: true },
        resume: { objectParams: true },
        switchCamera: { objectParams: true },
        snapshot: { objectParams: true },
        snapshot: { toggleTorch: true },
    })
}

const wxx = promisifiedWxApi
module.exports = wxx
