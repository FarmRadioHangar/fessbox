const initialState = {};

function messages(state = initialState, action) {
  console.log('Redux action received: <' + action.type + '>');
  switch (action.type) {
    case 'INBOX_MESSAGES':
      const { ids, messages } = action.data
      return {
        ids,
        messages
      };
    default:
      return state;
  }
}

const store = Redux.createStore(Redux.combineReducers({
  messages,
}));
