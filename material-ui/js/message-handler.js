import store from './store'
import * as types from './constants'

import { showNotification }
  from './actions'

export default function(eventType, data) {
  switch (eventType) {
    case 'echo':
      console.log('>>> echo >>>')
      console.log(data)
      console.log('<<<<<<<<<<<<')
      break
    case 'initialize':
      store.dispatch({ 
        type : types.APP_INITIALIZE, 
        data 
      })
      store.dispatch(showNotification('Successfully connected to Starship Enterprise.'))
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
