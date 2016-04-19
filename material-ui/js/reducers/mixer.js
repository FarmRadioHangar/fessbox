import { 
  APP_INITIALIZE, 
  CHANNEL_UPDATE,
  CHANNEL_VOLUME_UPDATE,
} from '../constants'

const initialState = {
  channelList : [],
}

function modeWeight(mode) {
  if ('master'  === mode) { return 1 } else 
  if ('free'    === mode) { return 4 } else 
  if ('on_hold' === mode) { return 3 } else 
  if ('ivr'     === mode) { return 5 } else 
  if ('defunct' === mode) { return 6 } else 
  if ('ring'    === mode) { return 0 } 
  return 2
}

function compareChannels(a, b) {
  return modeWeight(a[1].mode) - modeWeight(b[1].mode)
}

function channelList(channels) {
  return Object.entries(channels)
      .filter(item => 'operator' !== item[1].direction)
      .sort(compareChannels)
      .map(([id, chan]) => { 
    return {
      id,
      ...chan,
    }
  })
}

export default function(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE: {
      return {
        ...action.data.mixer,
        channelList : channelList(action.data.mixer.channels),
      }
    }
    case CHANNEL_UPDATE: {
      const channels = {
        ...state.channels,
        [action.id]: action.data, 
      }
      return {
        ...state, 
        channels, 
        channelList : channelList(channels),
      }
    }
    case CHANNEL_VOLUME_UPDATE: {
      const channels = {
        ...state.channels,
        [action.id]: {
          ...state.channels[action.id],
          level: action.level,
        }, 
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
