import * as types from './constants'

export default function(eventType, data, dispatch) {
  switch (eventType) {
    case 'echo':
      console.log('>>> echo >>>')
      console.log(data)
      console.log('<<<<<<<<<<<<')
      break
    case 'initialize':
      dispatch({ 
        type : types.APP_INITIALIZE, 
        data 
      })
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
