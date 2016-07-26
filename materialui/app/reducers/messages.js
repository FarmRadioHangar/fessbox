let all = {
  ids      : [],
  messages : {},
}

const collect = (limit) => {
  let unread  = 0,
      total   = 0,
      visible = []
  all.ids.forEach((id, i) => {
    const message = all.messages[id]
    if (i < limit) {
      visible.push({ ...message, id, })
    } else {
      if ('sms_in' === message.type) {
        ++unread;
      }
    }
    ++total;
  })
  return { unread, total, visible }
}

const initialState = {
  total   : 0,
  unread  : 0,
  limit   : 0,
  visible : [],
  ids     : [],
}

export default function(state = initialState, action) {
  switch (action.type) {
    case 'APP_INITIALIZE': {
      const inbox = action.data.inbox
      all.ids = action.data.inbox.ids
      all.messages = action.data.inbox.messages
      const { unread, total, visible } = collect(10)
      return {
        ...state, unread, total, visible,
        limit : 10,
        ids   : all.ids,
      }
    }
    case 'MESSAGES_DELETE_ONE': {
      delete all.messages[action.id]
      all.ids.splice(all.ids.indexOf(action.id), 1)
      const { unread, total, visible } = collect(state.limit)
      return {
        ...state, unread, total, visible,
        ids : all.ids,
      }
    }
    case 'MESSAGES_DELETE_BULK': {
      action.ids.forEach(id => {
        delete all.messages[id]
        all.ids.splice(all.ids.indexOf(id), 1)
      })
      const { unread, total, visible } = collect(state.limit)
      return {
        ...state, unread, total, visible,
        ids : all.ids,
      }
    }
    case 'MESSAGES_FETCH_ALL': {
      const limit = state.total
      const { total, visible } = collect(limit)
      return {
        ...state, visible, limit,
        unread : 0,
      }
    }
    case 'MESSAGES_INCREASE_LIMIT': {
      const limit = Math.min(state.total, state.limit + 5)
      if (state.limit == limit) {
        return state
      }
      const newVisible = all.ids.slice(state.limit, limit).map(id => { 
        const message = all.messages[id]
        return { ...message, id, }
      })
      let unread = state.unread
      newVisible.forEach(message => {
        if ('sms_in' === message.type) {
          --unread
        }
      })
      return {
        ...state, limit, unread,
        visible : state.visible.concat(newVisible),
      }
    }
    case 'MESSAGES_ADD_ONE': {
      const message = {
        ...action.message,
        id : action.id,
      }
      all.ids.push(action.id)
      all.messages[action.id] = message
      const total = state.total + 1
      const unread = ('sms_in' === message.type) ? state.unread + 1 
                                                 : state.unread
      let visible = state.visible
      if (visible.length < state.limit) {
        visible.push(message)
      }
      return {
        ...state, total, unread, visible,
      }
    }
    default:
      return state
  }
}
