import _                    from 'lodash'
import getQueryVariable     from './url-params'

import { combineReducers } 
  from 'redux'

const userId = getQueryVariable('user_id') 
const isHost = 'true' == getQueryVariable('host') 

const initialMixerState = {
  channels : {},
  master   : {},
  host     : {},
  sound    : false,
  active   : false,
}

function channelState(channels, chan, state) {
  return {
    ...channels,
    [chan]: Object.assign({}, channels[chan], state)
  }
}

function shouldPlaySound(channels) {
  for (let key in channels) {
    if (channels[key] && 'ring' === channels[key].mode) {
      return true
    }
  }
  return false
}

function mixer(state = initialMixerState, action) {
  switch (action.type) {
    case 'update-host': {
      return {
        ...state,
        host : action.state,
      }
    }
    case 'update-host-level': {

      console.log({
        ...state,
        host : {
          ...state.host,
          level : action.level
        }
      })

      return {
        ...state,
        host : {
          ...state.host,
          level : action.level
        }
      }
    }
    case 'update-mixer-active': {
      return {
        ...state,
        active : action.active,
      }
    }
    case 'initialize-mixer': {
      const sound = shouldPlaySound(action.state.channels)
      return {
        ...action.state, sound,
        active   : true,
        channels : _.pick(action.state.channels, _.identity),
      }
    }
    case 'update-mixer': {
      const channels = Object.assign({}, state.channels, action.state)
      const sound = shouldPlaySound(channels)
      return { 
        ...state, sound, 
        channels : _.pick(channels, _.identity),
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
            contact : Object.assign({}, state.channels[action.channel].contact, action.caller),
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
        master : action.state,
      }
    case 'update-master-level':
      return {
        ...state,
        master : {
          ...state.master,
          level : action.level,
        }
      }
    default:
      return state
  }
}

function users(state = {}, action) {
  switch (action.type) {
    case 'initialize-users': {
      return {
        _userId    : userId,
        _connected : action.state.hasOwnProperty(userId) && !!action.state[userId],
        ...action.state
      }
    }
    case 'update-user': {
      return {
        ...state,
        [action.userId] : action.state,
        _userId         : userId,
        _connected      : state.hasOwnProperty(userId) || action.userId == userId,
      }
    }
    case 'remove-user': {
      let users = _.omit(state, action.userId)
      users._userId = userId
      users._connected = users.hasOwnProperty(userId) && !!users[userId]
      return users
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
    case 'initialize-mixer': 
      return { isHost, ...state }
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
    default:
      return state
  }
}

const initialInboxState = {
  notifications: []
}

function inbox(state = initialInboxState, action) {
  switch (action.type) {
    case 'initialize-inbox':
      return {
        ...state,
        notifications: action.notifications
      }
    case 'update-inbox': 
      const message = {
        ...action.payload,
        id: action.id
      }
      return {
        ...state,
        notifications: [message, ...state.notifications]
      }
    case 'remove-message':
      return {
        ...state,
        notifications: state.notifications.filter(item => item.id != action.id)
      }
    default:
      return state
  }
}

const reducers = { mixer, users, client, inbox }

export default combineReducers(reducers)
