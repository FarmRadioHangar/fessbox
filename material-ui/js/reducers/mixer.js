import getUrlParam from '../url-params'

import { 
  APP_INITIALIZE, 
  CHANNEL_CONTACT_UPDATE,
  CHANNEL_SET_MUTED,
  CHANNEL_UPDATE,
  CHANNEL_VOLUME_UPDATE,
} from '../constants'

const userId = getUrlParam('user_id') 

const initialState = {
  channelList  : [], 
  userChanFree : false,
}

function modeWeight(mode) {
  /**/ if ('master'  === mode) { return 1 } 
  else if ('free'    === mode) { return 4 } 
  else if ('on_hold' === mode) { return 3 } 
  else if ('ivr'     === mode) { return 5 } 
  else if ('defunct' === mode) { return 6 } 
  else if ('ring'    === mode) { return 0 } 
  return 2
}

function compareChannels(a, b) {
  return modeWeight(a[1].mode) - modeWeight(b[1].mode)
}

function channelList(channels) {
  return Object.entries(channels)
      .filter(item => (item[1] && 'operator' !== item[1].direction))
      .sort(compareChannels)
      .map(([id, chan]) => { 
    return { id, ...chan, }
  })
}

export default function(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE: {
      if (!action.data.mixer) 
        return state
      const channels = action.data.mixer.channels || {}
      const connectedChan = userId ? channels[userId] : null
      return {
        ...action.data.mixer,
        channelList  : channelList(channels),
        userChanFree : !!connectedChan && ('free' === connectedChan.mode),
      }
    }
    case CHANNEL_SET_MUTED: {
      const channels = {
        ...state.channels,
        [action.id] : {
          ...state.channels[action.id],
          muted : action.muted,
        }
      }
      return {
        ...state, 
        channels, 
        channelList : channelList(channels),
      }
    }
    case CHANNEL_UPDATE: {
      const channels = {
        ...state.channels,
        [action.id] : action.data, 
      }
      const connectedChan = userId ? channels[userId] : null
      return {
        ...state, 
        channels, 
        channelList  : channelList(channels),
        userChanFree : !!connectedChan && ('free' === connectedChan.mode),
      }
    }
    case CHANNEL_VOLUME_UPDATE: {
      const channels = {
        ...state.channels,
        [action.id]: {
          ...state.channels[action.id],
          level : action.level,
        }, 
      }
      return {
        ...state,
        channels, 
        channelList : channelList(channels),
      }
    }
    case CHANNEL_CONTACT_UPDATE: {
      const channels = {
        ...state.channels,
        [action.id]: {
          ...state.channels[action.id],
          contact : Object.assign({}, state.channels[action.id].contact, action.info),
        }
      }
      return {
        ...state,
        channels,
        channelList : channelList(channels),
      }
    }
    default:
      return state
  }
}
