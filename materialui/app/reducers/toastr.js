const initialState = {
  nextKey  : 1,
  messages : [],
}

const createMessage = (content, key) => {
  return {
    key   : '' + String(key),
    added : Date.now() | 0,
    content,
  }
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'TOASTR_REMOVE_MESSAGE': {
      const messages = state.messages.filter(message => message.key != action.key)
      return {
        ...state,
        messages,
      }
    }
    case 'TOASTR_ADD_MESSAGE': {
      return {
        ...state,
        nextKey  : state.nextKey + 1,
        messages : [createMessage(action.message, state.nextKey), ...state.messages],
      }
    }
    case 'MESSAGES_DELETE_ONE': {
      return reducer(state, {
        type    : 'TOASTR_ADD_MESSAGE',
        message : 'The message was deleted.',
      })
    }
    case 'MESSAGES_DELETE_BULK': {
      const count = action.ids.length
      return reducer(state, {
        type    : 'TOASTR_ADD_MESSAGE',
        message : (count > 1 ? `${count} messages were deleted.`
                             : 'The message was deleted.'),
      })
    }
    case 'MESSAGES_ADD_ONE': {
      if ('sms_in' === action.message.type) {
        return reducer(state, {
          type    : 'TOASTR_ADD_MESSAGE',
          message : `New message from ${action.message.endpoint}`,
        })
      }
      return state
    }
    default:
      return state
  }
}
