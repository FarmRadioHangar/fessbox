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
import { initializeMixer, updateMixer, updateHost, updateMaster, updateMasterLevel, updateLevel }
  from './actions'

const hostId = getQueryVariable('host_id') || 701

const createPersistentStore = compose(persistState('client', {key: `__fessbox_client_${hostId}`}))(createStore)
const store = createPersistentStore(app, {client: {hostId, channels: {}}})
const ws = new ReconnectingWebSocket('ws://192.168.1.38:19998') 

class App extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const Ui = connect(state => {
      return {
        mixer  : state.mixer,
        client : state.client
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

ws.onmessage = e => { 
  if (e.data) {
    const msg = JSON.parse(e.data)
    //console.log(msg.event)
    //console.log(msg.data)
    switch (msg.event) {
      case 'initialize':
        store.dispatch(initializeMixer(msg.data.mixer))
        break
      case 'channelUpdate':
        store.dispatch(updateMixer(msg.data))
        break
      case 'channelVolumeChange':
        Object.keys(msg.data).forEach(chan => {
          store.dispatch(updateLevel(chan, msg.data[chan])) 
        })
        break
      case 'hostUpdate':
        store.dispatch(updateHost(msg.data))
        break
      case 'masterUpdate':
        store.dispatch(updateMaster(msg.data))
        break
      case 'masterVolumeChange':
        store.dispatch(updateMasterLevel(msg.data))
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
