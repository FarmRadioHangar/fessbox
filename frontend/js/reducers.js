import _ from 'lodash'

import { combineReducers } 
  from 'redux'

//const initialMixerState = {
//  channels : {},
//  master   : {},
//  host     : {}
//}

const initialMixerState = {
  channels : {
    'chan_1' : {
      level      : 10,
      direction  : 'incoming',
      mode       : 'ring',
      number     : '+255 712 444 333',
      muted      : false,
      duration   : null,
      contact    : {
        number   : '+255 712 444 333',
        name     : 'Manute Bol',
        location : {},
        notes    : {}
      },
      recording  : false
    },
    'chan_2' : {
      level      : 40,
      direction  : 'outgoing',
      mode       : 'ring',
      number     : '+255 712 444 333',
      muted      : false,
      duration   : null,
      contact    : {
        number   : '+255 712 155 789',
        name     : 'Uri Geller',
        location : {},
        notes    : {}
      },
      recording  : false
    },
    'chan_3' : {
      level      : 70,
      direction  : null,
      mode       : 'master',
      number     : '+255 712 444 333',
      muted      : true,
      duration   : null,
      contact    : null,
      recording  : false
    },
    'chan_4' : {
      level      : 90,
      direction  : null,
      mode       : 'free',
      number     : '+255 712 444 333',
      muted      : false,
      duration   : null,
      contact    : null,
      recording  : false
    }
  },
  master : {
    level     : 0,
    muted     : false,
    recording : false,
    delay     : 0
  },
  host : {}
}

function channelState(channels, chan, state) {
  return {
    ...channels,
    [chan]: Object.assign({}, channels[chan], state)
  }
}

function mixer(state = initialMixerState, action) {
  switch (action.type) {
    case 'initialize-mixer':
      return action.state
    case 'update-mixer':
      return { 
        ...state,
        channels : Object.assign({}, state.channels, action.state)
      }
    case 'mute':
    case 'unmute':
      return {
        ...state,
        channels : channelState(state.channels, action.channel, {
          muted : 'mute' === action.type
        })
      }
    case 'update-level':
      return {
        ...state,
        channels : channelState(state.channels, action.channel, {
          level : action.level
        })
      }
    case 'update-master-level':
      return {
        ...state,
        master : {
          ...state.master,
          level : action.level
        }
      }
    default:
      return state
  }
}

function client(state = {}, action) {
  switch (action.type) {
    case 'update-mode':
      switch (action.mode) {
        case 'host':
        case 'master':
        case 'on_hold':
        case 'ivr':
          return {
            ...state,
            channels : {
              ...state.channels,
              [action.channel]: {
                mode: action.mode
              }
            }
          }
        default:
          return state
      }
    case 'assign-host-id':
      return {
        ...state,
        host_id : action.host_id
      }
    default:
      return state
  }
}

const reducers = {
  mixer, client
}

export default combineReducers(reducers)
