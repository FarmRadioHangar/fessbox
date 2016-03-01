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
      window.setTimeout(() => store.dispatch(showNotification('Successfully connected to Starship Enterprise.')), 700)
      window.setTimeout(() => store.dispatch(showNotification('New message from xxx-xxx')), 1700)
      window.setTimeout(() => store.dispatch(showNotification('This is to test the message notifications.')), 2700)
      break
    case 'channelUpdate':
      break
    case 'inboxUpdate':
      break
    case 'event_error':
      break
    default:
      console.error(`Unknown event type: ${eventType}.`)
      break
  }
}
