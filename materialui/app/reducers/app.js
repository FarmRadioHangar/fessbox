import getUrlParam from '../urlparams'

const userId = getUrlParam('user_id') 

const initialState = {
  'status' : 'APP_STATUS_CONNECTING',
  'error'  : null,
  'diff'   : 0,
  'userId' : null,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case 'APP_INITIALIZE':
      if (!action.data || !action.data.mixer) {
        return {
          'status' : 'APP_STATUS_ERROR',
          'error'  : 'Initialization failed: Unexpected response from server.',
        }
      }
      return {
        ...state,
        'status' : 'APP_STATUS_INITIALIZED',
        'userId' : userId,
      }
    case 'APP_UPDATE_STATUS':
      return {
        ...state,
        'status' : action.status,
        'error'  : action.error,
      }
    case 'APP_SET_DIFF':
      return {
        ...state,
        'diff' : action.diff,
      }
    default:
      return state
  }
}
