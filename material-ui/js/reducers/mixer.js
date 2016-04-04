import { 
  APP_INITIALIZE, 
  CHANNEL_UPDATE,
  CHANNEL_VOLUME_UPDATE,
} from '../constants'

const initialState = {
  channelList : [],
}

function channelList(channels) {
  return Object.entries(channels)
      .filter(item => 'operator' !== item[1].direction)
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
