import store from './store'
import * as types from './constants'

import { showNotification, initializeApp }
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
      break
    case 'inboxUpdate':
      break
    case 'event_error':
    case 'input_error':
      console.log(eventType)
      break
    default:
      console.error(`Unknown event type: ${eventType}.`)
      break
  }
}
