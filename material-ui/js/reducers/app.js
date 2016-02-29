import { 
  APP_INITIALIZE, 
  APP_UPDATE_STATUS, 
  WS_STATUS_CONNECTED, 
  WS_STATUS_CONNECTING, 
  WS_STATUS_ERROR,
} from '../constants'

const initialState = {
  'status' : WS_STATUS_CONNECTING,
  'error'  : null,
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE:
    case APP_UPDATE_STATUS:
    default:
      return state
  }
}

export default reducer
