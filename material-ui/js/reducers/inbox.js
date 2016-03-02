import { 
  APP_INITIALIZE, 
} from '../constants'

const initialState = {
  messageCount    : 0,
  unreadCount     : 0,
  visibleMessages : [],
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE:
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
    default:
      return state
  }
}

export default reducer
