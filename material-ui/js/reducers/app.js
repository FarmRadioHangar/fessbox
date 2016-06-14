import { 
  APP_INITIALIZE, 
  APP_SET_DIALOG,
  APP_SET_DIFF,
  APP_STATUS_CONNECTING, 
  APP_STATUS_INITIALIZED, 
  APP_UPDATE_STATUS, 
} from '../constants'

const initialState = {
  'status'      : APP_STATUS_CONNECTING,
  'error'       : null,
  'dialog'      : null,
  'dialogState' : null,
  'diff'        : 0,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE:
      return {
        ...state,
        'status'      : APP_STATUS_INITIALIZED,
      }
    case APP_UPDATE_STATUS:
      return {
        ...state,
        'status'      : action.status,
        'error'       : action.error,
      }
    case APP_SET_DIALOG:
      return {
        ...state,
        'dialog'      : action.dialog,
        'dialogState' : action.state,
      }
    case APP_SET_DIFF:
      return {
        ...state,
        'diff'        : action.diff,
      }
    default:
      return state
  }
}
