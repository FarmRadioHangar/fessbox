import React                from 'react'
import ReactDOM             from 'react-dom'
import app                  from './reducers'
import Ui                   from '../modules/Ui'
import injectTapEventPlugin from 'react-tap-event-plugin'
import thunk                from 'redux-thunk'

import { createStore } 
  from 'redux'
import { Provider } 
  from 'react-redux'
import { initializeMixer, updateMixer }
  from './actions'

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)
const store = createStoreWithMiddleware(app)
const ws = new WebSocket('ws://192.168.1.38:19998') 

class App extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <Ui ws={ws} />
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

ws.onopen  = e => { console.log('open') } 
ws.onclose = e => { console.log('close') } 

ws.onmessage = e => { 
  if (e.data) {
    const msg = JSON.parse(e.data)
    console.log(msg.event)
    console.log(msg.data)
    switch (msg.event) {
      case 'echo': 
        // For testing
        break
      case 'initialize':
        store.dispatch(initializeMixer(msg.data.mixer))
        break
      case 'channelUpdate':
        store.dispatch(updateMixer(msg.data))
        break
      default:
        break
    }
  }
} 

ws.onerror = e => { 
  console.log('error')
}

