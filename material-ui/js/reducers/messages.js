import { messages } from '../db'

import { 
  APP_INITIALIZE, 
  MESSAGE_ADD,
  MESSAGE_REMOVE,
  MESSAGE_STAR,
  MESSAGE_UNSTAR,
  MESSAGE_WINDOW_GROW,
  MESSAGE_WINDOW_REQUEST_OLDER,
} from '../constants'

function fetchVisible(offset, limit) {
  return messages.chain()
                 .simplesort('$loki', false)
                 .offset(offset)
                 .limit(limit)
                 .data()
}

const MAX_WINDOW_SIZE = 512
const BATCH_SIZE = 5

const initialState = {
  total    : 0,
  visible  : [],
  offset   : 0,
  limit    : 0,
  unread   : 0,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE: {
      const inbox = action.data.inbox.messages
      let unread = 0
      Object.keys(inbox).reverse().forEach(id => {
        if ('sms_in' === inbox[id].type) {
          ++unread
        }
        messages.insert({
          ...inbox[id],
          id,
        })
      }) 
      return {
        ...state, unread,
        visible : [], 
        total   : messages.count(),
      }
    }
    case MESSAGE_UNSTAR: {
      let message = { ...messages.get(action.id), favorite : false }
      const updated = messages.update(message)
      return {
        ...state,
        visible : state.visible.map(m => m['$loki'] === action.id ? updated : m),
      }
    }
    case MESSAGE_STAR: {
      let message = { ...messages.get(action.id), favorite : true }
      const updated = messages.update(message)
      return {
        ...state,
        visible : state.visible.map(m => m['$loki'] === action.id ? updated : m),
      }
    }
    case MESSAGE_WINDOW_GROW: {
      let limit = state.limit + BATCH_SIZE
      let offset = state.offset
      if (limit > MAX_WINDOW_SIZE) {
        offset += (limit - MAX_WINDOW_SIZE)
        limit = MAX_WINDOW_SIZE
      }
      if (offset + limit > state.total) {
        offset = Math.max(0, state.total - limit)
        limit = state.total - offset
      }
      const old = offset > state.offset
          ? state.visible.slice(offset - state.offset) 
          : state.visible
      const t = state.offset + state.limit
      const recent = fetchVisible(t, (offset + limit) - t)
      let unread = state.unread
      recent.forEach(message => {
        if ('sms_in' === message.type) {
          --unread
        }
      })
      return {
        ...state, limit, offset, unread,
        visible : old.concat(recent),
      }
    }
    case MESSAGE_WINDOW_REQUEST_OLDER: {
      if (0 == state.offset) {
        return state
      }
      const diff = Math.min(state.offset, BATCH_SIZE)
      const offset = state.offset - diff
      const limit = Math.min(state.limit + diff, MAX_WINDOW_SIZE)
      const s = offset + limit - state.offset
      let unread = state.unread
      state.visible.slice(s).forEach(message => {
        if ('sms_in' === message.type) {
          unread++
        }
      })
      return {
        ...state, limit, offset, unread,
        visible : fetchVisible(offset, state.offset - offset).concat(state.visible.slice(0, s)),
      }
    }
    case MESSAGE_REMOVE: {
      const messageId = messages.get(action.id).id
      messages.remove(action.id)
      return {
        ...state, 
        total   : state.total - 1, 
        limit   : state.limit - 1,
        visible : state.visible.filter(m => m.id !== messageId), 
      }
    }
    case MESSAGE_ADD: {
      let message = {
        ...action.message,
        id : action.id,
      }
      messages.insert(message)
      let visible = state.visible
      let unread = state.unread
      const total = state.total + 1
      if (state.offset + state.limit >= total) {
        visible = visible.concat(message)
      } else {
        unread = ('sms_in' === action.message.type)
            ? state.unread + 1 
            : state.unread
      }
      return { ...state, unread, total, visible }
    }
    default:
      return state
  }
}
