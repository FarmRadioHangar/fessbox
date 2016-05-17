import store from './store'
import * as types from './constants'

import { 
  addMessage, 
  initializeApp, 
  removeMessage, 
  setDiff,
  showNotification, 
  toastrAddMessage, 
  updateAppStatus, 
  updateChannel, 
  updateChannelVolume, 
} from './actions'

export default function(eventType, data) {
  switch (eventType) {
    case 'echo':
      console.log('>>> echo >>>')
      console.log(data)
      console.log('<<<<<<<<<<<<')
      break
    case 'initialize':
      console.log(JSON.stringify(data))
      store.dispatch(initializeApp(data))
      store.dispatch(setDiff(Date.now() - data.server_time))
      break
    case 'channelUpdate':
      Object.keys(data).forEach(key => {
        const chan = data[key]
        if (chan) {
          store.dispatch(updateChannel(key, chan))
          if ('ring' == chan.mode) {
            new Notification(`Incoming call from ${chan.number}.`)
          }
        } else {
          //
        }
      })
      break
    case 'channelVolumeChange':
      Object.keys(data).forEach(id => {
        store.dispatch(updateChannelVolume(id, data[id]))
      })
      break
    case 'inboxUpdate':
      Object.keys(data).forEach(id => {
        const message = data[id]
        if (message) {
          store.dispatch(addMessage(id, message))
          if ('sms_in' === message.type) {
            store.dispatch(toastrAddMessage('New message from ' + message.endpoint))
          }
        } else {
          store.dispatch(removeMessage(id))
        }
      })
      break
    case 'messageSent':
      store.dispatch(toastrAddMessage('SMS message sent.'))
      break
    case 'event_error':
    case 'input_error':
      console.log(`Error: ${eventType}`)
      console.error(data.msg)
      break
    default:
      console.log(data)
      console.error(`Unknown event type: ${eventType}.`)
      break
  }
}
