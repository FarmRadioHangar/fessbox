import 'babel-polyfill' 
import React            from 'react'
import ReactDOM         from 'react-dom'
import getUrlParam      from './url-params'
import reducers         from './reducers'
import Ui               from '../modules/ui'

import injectTapEventPlugin 
  from 'react-tap-event-plugin'
import { ReconnectingWebSocket } 
  from 'awesome-websocket'
import { createStore } 
  from 'redux'
import { Provider } 
  from 'react-redux'

injectTapEventPlugin()

const userId   = getUrlParam('user_id') 
const hostUrl  = getUrlParam('host_url') || 'fessbox.local:19998' // '192.168.1.38:19998'
const language = getUrlParam('language') || 'en' 

const ws = new ReconnectingWebSocket(`ws://${hostUrl}/?user_id=${userId}`) 
const store = createStore(reducers, {})

ws.onopen  = () => { console.log('WebSocket connection established.') } 
ws.onclose = () => { console.log('WebSocket connection closed.') } 

ws.onmessage = e => { 
}

ws.onerror = e => { 
  console.error(e)
  //store.dispatch(updateUiStatus(UI_STATUS_ERROR, 'Error establishing WebSocket connection.'))
}

function sendMessage(type, data) {
  ws.send(JSON.stringify({
    event: type, 
    data
  }))
}

ReactDOM.render(
  <Provider store={store}>
    <Ui sendMessage={sendMessage} />
  </Provider>,
  document.getElementById('main')
)
