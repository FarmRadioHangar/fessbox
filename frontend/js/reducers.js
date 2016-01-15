import _ from 'lodash'

import { combineReducers } 
  from 'redux'

const initialMixerState = {
  channels : {},
  master   : {},
  host     : {},
  sound    : false
}

function channelState(channels, chan, state) {
  return {
    ...channels,
    [chan]: Object.assign({}, channels[chan], state)
  }
}

function shouldPlaySound(channels) {
  for (let key in channels) {
    if ('ring' === channels[key].mode) {
      return true
    }
  }
  return false
}

function mixer(state = initialMixerState, action) {
  switch (action.type) {
    case 'initialize-mixer': {
      const sound = shouldPlaySound(action.state.channels)
      return {
        ...action.state, sound
      }
    }
    case 'update-mixer': {
      const channels = Object.assign({}, state.channels, action.state)
      const sound = shouldPlaySound(channels)
      return { 
        ...state, sound, channels 
      }
    }
    case 'mute':
    case 'unmute':
      return {
        ...state,
        channels : channelState(state.channels, action.channel, {
          muted : 'mute' === action.type
        })
      }
    case 'update-caller':
      return {
        ...state, 
        channels : {
          ...state.channels,
          [action.channel] : {
            ...state.channels[action.channel],
            contact : Object.assign({}, state.channels[action.channel].contact, action.caller)
          }
        }
      }
    case 'update-level':
      return {
        ...state,
        channels : channelState(state.channels, action.channel, {
          level : action.level
        })
      }
    case 'update-master': 
      return {
        ...state,
        master : action.state
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

function users(state = {}, action) {
  switch (action.type) {
    case 'initialize-users':
      return action.state
    case 'update-user':
      return {
        ...state,
        [action.userId] : action.state
      }
    case 'update-user-level':
      return {
        ...state,
        [action.userId] : Object.assign({}, state[action.userId], { level : action.level })
      }
    default:
      return state
  }
}

function client(state = {}, action) {
  switch (action.type) {
    case 'set-diff':
      return {
        ...state, 
        diff : action.diff
      }
    case 'update-preset':
      switch (action.preset) {
        case 'host':
        case 'master':
        case 'on_hold':
        case 'ivr':
          return {
            ...state,
            channels : {
              ...state.channels,
              [action.channel]: {
                preset : action.preset
              }
            }
          }
        default:
          return state
      }
    case 'update-inbox':
      const notifications = state.notifications || {}
      return {
        ...state,
        notifications: {
          ...notifications,
          [action.payload.type] : [action.payload, ...notifications[action.payload.type] || []]
        }
      }
    default:
      return state
  }
}

const reducers = { mixer, users, client }

export default combineReducers(reducers)
