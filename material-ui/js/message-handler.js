import store from './store'
import * as types from './constants'

import { showNotification, initializeApp, updateChannel, updateChannelVolume, removeMessage }
  from './actions'

export default function(eventType, data) {
  switch (eventType) {
    case 'echo':
      console.log('>>> echo >>>')
      console.log(data)
      console.log('<<<<<<<<<<<<')
      break
    case 'initialize':
      store.dispatch(initializeApp(data))
      if ('Notification' in window) {
        new Notification('Successfully connected to Starship Enterprise.')
        new Notification('New message from xxx-xxx')
        new Notification('This is to test the message notifications.')
      }
      break
    case 'channelUpdate':
      Object.keys(data).forEach(key=> {
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
          //
        } else {
          store.dispatch(removeMessage(id))
        }
      })
      break
    case 'event_error':
    case 'input_error':
      console.log(`error: ${eventType}`)
      break
    default:
      console.error(`Unknown event type: ${eventType}.`)
      break
  }
}
