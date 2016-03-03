import { 
  APP_INITIALIZE, 
  MESSAGE_TOGGLE_READ,
  MESSAGE_TOGGLE_FAVORITE,
  MESSAGE_TOGGLE_SELECTED,
} from '../constants'

const initialState = {
  messageCount    : 0,
  unreadCount     : 0,
  visibleMessages : [],
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE: {
      const { ids } = action.data.inbox
      return Object.assign({}, state, {
        ...action.data.inbox,
        messageCount    : ids.length,
        unreadCount     : ids.length,
        visibleMessages : ids.slice(0, 25).map(id => ({
          ...action.data.inbox.messages[id],
          id,
        })),
      })
    }
    case MESSAGE_TOGGLE_READ: {
      const visibleMessages = state.visibleMessages.map(message => 
        message.id == action.id ? { ...message, read: !message.read } : message)
      const unreadCount = visibleMessages.filter(message => !message.read).length
      return {
        ...state,
        visibleMessages,
        unreadCount,
      }
    }
    case MESSAGE_TOGGLE_SELECTED: {
      const visibleMessages = state.visibleMessages.map(message => 
        message.id == action.id ? { ...message, selected: !message.selected } : message)
      return {
        ...state,
        visibleMessages,
      }
    }
    case MESSAGE_TOGGLE_FAVORITE: {
      const visibleMessages = state.visibleMessages.map(message => 
        message.id == action.id ? { ...message, favorite: !message.favorite } : message)
      return {
        ...state,
        visibleMessages,
      }
    }
    default:
      return state
  }
}

export default reducer
