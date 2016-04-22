import { 
  APP_INITIALIZE, 
  MESSAGE_FAVORITES_CLEAR,
  MESSAGE_MARK_ALL_READ,
  MESSAGE_ADD,
  MESSAGE_REMOVE,
  MESSAGE_TOGGLE_PROPERTY,
} from '../constants'

const initialState = {
  messageCount    : 0,
  unreadCount     : 0,
  visibleMessages : [],
  favorites       : [],
}

export default function(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE: {
      const { ids } = action.data.inbox
      const visibleMessages = ids.slice(0, 100).map(id => ({
        ...action.data.inbox.messages[id],
        id,
      }))
      const favorites = visibleMessages.filter(message => message.favorite)
      const obj = Object.assign({}, state, {
        ...action.data.inbox,
        messageCount    : ids.length,
        unreadCount     : ids.length,
        visibleMessages,
        favorites,
      })
      return obj
    }
    case MESSAGE_ADD: {
      const ids = [action.id, ...state.ids]
      const messages = {
        [action.id] : action.message,
        ...state.messages,
      }
      const visibleMessages = ids.slice(0, 100).map(id => ({ ...messages[id], id }))
      const favorites = visibleMessages.filter(message => message.favorite)
      return {
        ...state,
        messages, 
        visibleMessages,
        favorites,
        messageCount : ids.length,
      }
    }
    case MESSAGE_REMOVE: {
      const ids = state.ids.filter(id => id != action.id)
      const visibleMessages = ids.slice(0, 100).map(id => ({
        ...state.messages[id],
        id,
      }))
      const favorites = visibleMessages.filter(message => message.favorite)
      return {
        ...state,
        ids, 
        visibleMessages,
        favorites,
        messageCount : ids.length,
      }
    }
    case MESSAGE_TOGGLE_PROPERTY: {
      const visibleMessages = state.visibleMessages.map(message => 
        message.id == action.id ? { ...message, [action.property]: !message[action.property] } : message)
      const favorites = visibleMessages.filter(message => message.favorite)
      return {
        ...state,
        visibleMessages,
        favorites,
      }
    }
    case MESSAGE_MARK_ALL_READ: {
      return {
        ...state,
        unreadCount: 0,
      }
    }
    case MESSAGE_FAVORITES_CLEAR: {
      const visibleMessages = state.visibleMessages.map(message => ({
        ...message,
        favorite : false,
      }))
      return {
        ...state,
        visibleMessages,
        favorites : [],
      }
    }
    default:
      return state
  }
}
