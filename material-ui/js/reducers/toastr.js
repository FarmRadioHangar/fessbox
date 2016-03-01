import { 
  APP_INITIALIZE, 
  TOASTR_ADD_MESSAGE,
  TOASTR_REMOVE_MESSAGE,
  TOASTR_REFRESH,
} from '../constants'

const initialState = {
  nextKey  : 1,
  messages : [],
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case TOASTR_REFRESH: {
      if (!state.messages.length) {
        return state
      }
      const threshold = (Date.now() | 0) - 2000000
      const messages = state.messages.filter(message => message.added > threshold)
      return {
        ...state,
        messages,
      }
    }
    case TOASTR_REMOVE_MESSAGE: {
      const messages = state.messages.filter(message => message.key != action.key)
      return {
        ...state,
        messages,
      }
    }
    case TOASTR_ADD_MESSAGE: {
      const message = {
        key     : '' + state.nextKey,
        content : action.message,
        added   : Date.now() | 0,
      }
      return {
        ...state,
        nextKey  : state.nextKey + 1,
        messages : [message, ...state.messages],
      }
    }
    case APP_INITIALIZE:
    default:
      return state
  }
}

export default reducer
