import store from './store'
import * as types from './constants'

import { 
  addMessage, 
  initializeApp, 
  removeMessage, 
  setDiff,
  showNotification, 
  toastrAddMessage, 
  channelContactInfo,
  updateAppStatus, 
  updateCaller,
  updateChannel, 
  updateChannelVolume, 
  updateChannelContact,
} from './actions'

function showDesktopNotification(msg) {
  if (!('Notification' in window)) {
    return
  } else if (Notification.permission === 'granted') {
    var notification = new Notification(msg);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission((permission) => {
      if (permission === 'granted') {
        var notification = new Notification(msg);
      }
    })
  }
}

export default function(eventType, data) {
  switch (eventType) {
    case 'echo':
      if ('noop' !== data.event) {
        console.log('>>> echo >>>')
        console.log(data)
        console.log('<<<<<<<<<<<<')
      }
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
          if ('ring' == chan.mode && 'incoming' == chan.direction && chan.contact) {
            const text = `Incoming call from ${chan.contact.number}.`
            showDesktopNotification(text)
            store.dispatch(toastrAddMessage(text))
          }
        } else {
          //
        }
      })
      break
    case 'channelContactInfo':
      Object.keys(msg.data).forEach(chan => {
        store.dispatch(updateChannelContact(chan, msg.data[chan]))
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
        } else {
          store.dispatch(removeMessage(id))
        }
      })
      break
    case 'userUpdate':
      Object.keys(msg.data).forEach(id => {
        const user = msg.data[user]
        if (user) {
          store.dispatch(updateUser(id, user)) 
        } else {
          store.dispatch(removeUser(id)) 
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
