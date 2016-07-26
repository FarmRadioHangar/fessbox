import getUrlParam from '../urlparams'

const userId = getUrlParam('user_id') 

const initialState = {
  channelList  : [], 
  userChanFree : false,
  ringing      : false,
}

const modeWeight = (mode) => {
  /**/ if ('master'  === mode) { return 1 } 
  else if ('free'    === mode) { return 4 } 
  else if ('on_hold' === mode) { return 3 } 
  else if ('ivr'     === mode) { return 5 } 
  else if ('defunct' === mode) { return 6 } 
  else if ('ring'    === mode) { return 0 } 
  return 2
}

const compareChannels = (a, b) => 
  modeWeight(a[1].mode) - modeWeight(b[1].mode)

const channelList = (channels) => 
  Object.entries(channels)
      .filter(item => (item[1] && 'operator' !== item[1].direction))
      .sort(compareChannels)
      .map(([id, chan]) => ({ id, ...chan, }))

const isRinging = (channels) => {
  for (let i = 0; i < channels.length; i++) {
    const chan = channels[i]
    if ('ring' == chan.mode && 'incoming' == chan.direction) {
      return true
    }
  }
  return false
}

export default function(state = initialState, action) {
  switch (action.type) {
    case 'APP_INITIALIZE': {
      if (!action.data.mixer) {
        return state
      }
      const channels = action.data.mixer.channels || {}
      const connectedChan = userId ? channels[userId] : null
      return {
        ...action.data.mixer,
        channelList  : channelList(channels),
        userChanFree : !!connectedChan && ('free' === connectedChan.mode),
        ringing      : false,
      }
    }
    case 'CHANNEL_CONTACT_UPDATE': {
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
    case 'CHANNEL_VOLUME_UPDATE': {
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
    case 'CHANNEL_UPDATE': {
      const channels = {
        ...state.channels,
        [action.id] : action.data, 
      }
      const connectedChan = userId ? channels[userId] : null
      const list = channelList(channels)
      return {
        ...state, channels, 
        channelList  : list,
        ringing      : isRinging(list),
        userChanFree : !!connectedChan && ('free' === connectedChan.mode),
      }
    }
    default:
      return state
  }
}
