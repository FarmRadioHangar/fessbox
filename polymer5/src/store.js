const initialState = [];

function messageReducer(state = initialState, action) {
  console.log('Redux action received: <' + action.type + '>');
  switch (action.type) {
    default:
      return state;
  }
}

const store = Redux.createStore(Redux.combineReducers({
  messageReducer,
}));
