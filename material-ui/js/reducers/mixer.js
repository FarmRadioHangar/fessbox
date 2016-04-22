import { 
  APP_INITIALIZE, 
  CHANNEL_UPDATE,
  CHANNEL_CONTACT_UPDATE,
  CHANNEL_VOLUME_UPDATE,
} from '../constants'

//const initialState = {
//  channelList : [],
//}


const initialState = {
  "channels": {
    "airtel1": {
      "type": "Dongle",
      "level": 56,
      "direction": "incoming",
      "label": "+255689514544",
      "mode": "ring",
      "muted": false,
      "timestamp": 1461056646818,
      "autoanswer": null,
      "contact": {
        "name": "johannes",
        "number": "+255678647268"
      },
      "recording": false,
      "number": "+255689514544",
      "error": "not connected"
    },
    "tigo1": {
      "type": "Dongle",
      "level": 56,
      "direction": "incoming",
      "label": "+255689514544",
      "mode": "master",
      "muted": false,
      "timestamp": 1461066884306,
      "autoanswer": null,
      "contact": {
        "name": "johannes",
        "number": "+255678647268"
      },
      "recording": false,
      "number": "+255689514544",
      "error": "not connected"
    },
//    "tigo1": {
//      "type": "dongle",
//      "level": 67,
//      "direction": null,
//      "label": "+255718885887",
//      "mode": "defunct",
//      "muted": false,
//      "timestamp": null,
//      "autoanswer": null,
//      "contact": null,
//      "recording": false
//    },
    "vodacom1": {
      "type": "Dongle",
      "level": 67,
      "direction": null,
      "label": "+255754885885",
      "mode": "free",
      "muted": false,
      "timestamp": null,
      "autoanswer": null,
      "contact": null,
      "recording": false,
      "number": "+255754885885",
      "error": "not connected"
    }
  },
  "master": {
    "level": 79,
    "on_air": true,
    "muted": false,
    "recording": false,
    "delay": 0,
    "out": {
      "level": 66,
      "muted": false
    },
    "in": {
      "level": 75,
      "muted": false
    }
  },
  "host": {
    "level": 75,
    "muted": false
  },
  "channelList": [
    {
      "id": "airtel1",
      "type": "Dongle",
      "level": 56,
      "direction": "incoming",
      "label": "+255689514544",
      "mode": "ring",
      "muted": false,
      "timestamp": 1461056646818,
      "autoanswer": null,
      "contact": {
        "name": "johannes",
        "number": "+255678647268"
      },
      "recording": false,
      "number": "+255689514544",
      "error": "not connected"
    },
    {
      "id": "vodacom1",
      "type": "Dongle",
      "level": 67,
      "direction": null,
      "label": "+255754885885",
      "mode": "free",
      "muted": false,
      "timestamp": null,
      "autoanswer": null,
      "contact": null,
      "recording": false,
      "number": "+255754885885",
      "error": "not connected"
    },
    {
      "id": "tigo1",
      "type": "Dongle",
      "level": 56,
      "direction": "incoming",
      "label": "+255689514544",
      "mode": "master",
      "muted": false,
      "timestamp": 1461066884306,
      "autoanswer": null,
      "contact": {
        "name": "Uri Geller",
        "number": "+255678647268"
      },
      "recording": false,
      "number": "+255689514544",
      "error": "not connected"
    },
  ]
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
        [action.id] : action.data, 
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
