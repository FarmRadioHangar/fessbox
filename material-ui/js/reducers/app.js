import { 
  APP_INITIALIZE, 
  APP_UPDATE_STATUS, 
  WS_STATUS_CONNECTED, 
  WS_STATUS_CONNECTING, 
} from '../constants'

const initialState = {
  'status' : WS_STATUS_CONNECTING,
  'error'  : null,
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE:
      return {
        ...state,
        'status' : WS_STATUS_CONNECTED,
      }
    case APP_UPDATE_STATUS:
      return {
        ...state,
        'status' : action.status,
        'error'  : action.error,
      }
    default:
      return state
  }
}

export default reducer
