import React                from 'react'
import ReactDOM             from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import persistState         from 'redux-localstorage'
import app                  from './reducers'
import getQueryVariable     from './url-params'
import ui                   from '../modules/Ui'

import { ReconnectingWebSocket } 
  from 'awesome-websocket'
import { compose, createStore } 
  from 'redux'
import { Provider, connect } 
  from 'react-redux'
import { initializeMixer, initializeUsers, updateUser, updateMixer, updateMaster, updateMasterLevel, updateLevel, setTimeDiff, updateCaller, updateInbox }
  from './actions'

const userId  = getQueryVariable('user_id') || 701
//const hostUrl = getQueryVariable('host_url') || '192.168.1.38:19998'
const hostUrl = getQueryVariable('host_url') || '192.168.1.77:19998'

const createPersistentStore = compose(persistState('client', {key: `__fessbox_client_${userId}`}))(createStore)
const store = createPersistentStore(app, {client: {userId, channels: {}, notifications: {}, $: Math.random()*1000000000|0}})
const ws = new ReconnectingWebSocket(`ws://${hostUrl}/?user_id=${userId}`) 

class App extends React.Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
      /* @TODO -- REMOVE
    store.dispatch(updateInbox(1, {
      type      : 'sms_in',
      timestamp : Date.now(),
      source    : '123123132',
      content   : 'hello'
    }))
    store.dispatch(updateInbox(2, {
      type      : 'sms_in',
      timestamp : Date.now(),
      source    : '123123132',
      content   : 'hello again'
    }))
        */
  }
  render() {
    const Ui = connect(state => {
      return {
        mixer  : state.mixer,
        client : state.client,
        users  : state.users
      }
    })(ui)
    return (
      <Ui sendMessage={(type, data) => {
        ws.send(JSON.stringify({ event : type, data }))
      }} />
    )
  }
}

injectTapEventPlugin()

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('main')
)

ws.onopen  = () => { console.log('open') } 
ws.onclose = () => { console.log('close') } 

const channels = {
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
      location : '',
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
    contact    : {
      number   : '+255 712 155 789',
      name     : 'Uri Geller',
      location : '',
      notes    : {}
    },
    recording  : false
  },
  'chan_4' : {
    level      : 90,
    direction  : null,
    mode       : 'defunct',
    number     : '+255 712 444 333',
    muted      : false,
    duration   : null,
    contact    : null,
    recording  : false
  },
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
      location : '',
      notes    : {}
    },
    recording  : false
  }
}

const temp = {
  channels,
  master : {
    delay     : 0,
    level     : 38,
    muted     : false,
    on_air    : true,
    recording : false
  },
  host   : {},
  sound  : false
}

ws.onmessage = e => { 
  if (e.data) {
    const msg = JSON.parse(e.data)
    console.log('>>> Message')
    console.log(msg)
    console.log('<<<')
    switch (msg.event) {
      case 'initialize':
        store.dispatch(initializeMixer(msg.data.mixer))
        //store.dispatch(initializeMixer(temp))
        if (msg.data.users) {
          store.dispatch(initializeUsers(msg.data.users))
        }
        // Compute time difference between server and device
        const diff = Date.now() - msg.data.server_time
        console.log(`diff : ${diff}`)
        store.dispatch(setTimeDiff(diff))
        break
      case 'channelUpdate':
        store.dispatch(updateMixer(msg.data))
        break
      case 'channelVolumeChange':
        Object.keys(msg.data).forEach(chan => {
          store.dispatch(updateLevel(chan, msg.data[chan])) 
        })
        break
      case 'userUpdate':
        Object.keys(msg.data).forEach(user => {
          store.dispatch(updateUser(user, msg.data[user])) 
        })
        break
      case 'masterUpdate':
        store.dispatch(updateMaster(msg.data))
        break
      case 'masterVolumeChange':
        store.dispatch(updateMasterLevel(msg.data))
        break
      case 'channelContactInfo':
        Object.keys(msg.data).forEach(chan => {
          store.dispatch(updateCaller(chan, msg.data[chan]))
        })
        break
      case 'inboxUpdate':
        Object.keys(msg.data).forEach(id => {
          store.dispatch(updateInbox(id, msg.data[id]))
        })
        break
      default:
        break
    }
  }
} 

ws.onerror = e => { 
  console.log('error')
  console.log(e)
}
