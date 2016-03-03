import { 
  APP_INITIALIZE, 
  MESSAGE_TOGGLE_PROPERTY,
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
        visibleMessages : ids.slice(0, 10).map(id => ({
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
    default:
      return state
  }
}

export default reducer
