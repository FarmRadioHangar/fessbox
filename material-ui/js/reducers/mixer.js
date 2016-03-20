import { 
  APP_INITIALIZE, 
  CHANNEL_UPDATE,
} from '../constants'

const initialState = {
  channelList  : [],
}

function channelList(channels) {
  return Object.entries(channels).map(([id, chan]) => {
    return {
      id,
      ...chan,
    }
  })
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_INITIALIZE:
      return {
        ...action.data.mixer,
        channelList : channelList(action.data.mixer.channels),
      }
    case CHANNEL_UPDATE:
      const channels = {
        ...state.channels,
        [action.id]: action.data, 
      }
      return {
        ...state, 
        channels, 
        channelList : channelList(channels),
      }
    default:
      return state
  }
}

export default reducer
