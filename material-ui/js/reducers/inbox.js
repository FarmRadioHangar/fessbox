import { 
  APP_INITIALIZE, 
  MESSAGE_TOGGLE_PROPERTY,
  MESSAGE_REMOVE,
} from '../constants'

const initialState = {
  messageCount    : 0,
  unreadCount     : 0,
  visibleMessages : [],
}

export default function(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE: {
      const { ids } = action.data.inbox
      return Object.assign({}, state, {
        ...action.data.inbox,
        messageCount    : ids.length,
        unreadCount     : ids.length,
        visibleMessages : ids.slice(0, 100).map(id => ({
          ...action.data.inbox.messages[id],
          id,
        })),
      })
    }
    case MESSAGE_TOGGLE_PROPERTY: {
      const visibleMessages = state.visibleMessages.map(message => 
        message.id == action.id ? { ...message, [action.property]: !message[action.property] } : message)
      const unreadCount = visibleMessages.filter(message => !message.read).length
      return {
        ...state,
        visibleMessages,
        unreadCount,
      }
    }
    case MESSAGE_REMOVE: {
      const ids = state.ids.filter(id => id != action.id)
      const visibleMessages = ids.slice(0, 100).map(id => ({
        ...state.messages[id],
        id,
      }))
      return {
        ...state,
        ids, 
        visibleMessages,
        messageCount : ids.length,
        unreadCount  : visibleMessages.filter(message => !message.read).length,
      }
    }
    default:
      return state
  }
}
