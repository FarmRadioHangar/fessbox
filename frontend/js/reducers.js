import { combineReducers } 
  from 'redux'

const initialMixerState = {
  channels : {
    'chan_1' : {},
    'chan_2' : {},
    'chan_3' : {},
    'chan_4' : {}
  },
  master : {},
  host : {}
}

function mixer(state = initialMixerState, action) {
  switch (action.type) {
    default:
      return state
  }
}

const reducers = {
  mixer
}

export default combineReducers(reducers)
