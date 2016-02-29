import { 
  APP_INITIALIZE, 
  APP_STATUS_CONNECTED, 
  APP_STATUS_CONNECTING, 
  APP_STATUS_INITIALIZED, 
  APP_UPDATE_STATUS, 
} from '../constants'

const initialState = {
  'status' : APP_STATUS_CONNECTING,
  'error'  : null,
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE:
      return {
        ...state,
        'status' : APP_STATUS_INITIALIZED,
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
