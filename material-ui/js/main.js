import 'babel-polyfill' 
import React            from 'react'
import ReactDOM         from 'react-dom'
import getUrlParam      from './url-params'
import store            from './store'
import messageHandler   from './message-handler'
import Ui               from '../modules/ui'

import injectTapEventPlugin 
  from 'react-tap-event-plugin'
import { ReconnectingWebSocket } 
  from 'awesome-websocket'
import { Provider } 
  from 'react-redux'
import { APP_STATUS_ERROR, APP_STATUS_CONNECTED } 
  from './constants'
import { updateAppStatus }
  from './actions'

injectTapEventPlugin()

const userId   = getUrlParam('user_id') 
const hostUrl  = getUrlParam('host_url') || 'fessbox.local:19998' // '192.168.1.38:19998'
const language = getUrlParam('language') || 'en' 

const ws = new ReconnectingWebSocket(`ws://${hostUrl}/?user_id=${userId}`) 

ws.onopen = () => { 
  console.log('WebSocket connection established.') 
  store.dispatch(updateAppStatus(APP_STATUS_CONNECTED))
} 

ws.onclose = () => { console.log('WebSocket connection closed.') } 

function parseMessage(message) {
  if (message) {
    try {
      return JSON.parse(message)
    } catch (err) {
      console.log(err)
    }
  }
  return null
}

ws.onmessage = (e => { 
  const message = parseMessage(e.data)
  if (message) {
    console.log('>>> Message')
    console.log(message)
    console.log('<<<')
  
    messageHandler(message.event, message.data)
  }
})

ws.onerror = e => { 
  console.error(e)
  store.dispatch(updateAppStatus(APP_STATUS_ERROR, 'Error establishing WebSocket connection.'))
}

function sendMessage(type, data) {
  ws.send(JSON.stringify({
    event : type, 
    data
  }))
}

ReactDOM.render(
  <Provider store={store}>
    <Ui sendMessage={sendMessage} />
  </Provider>,
  document.getElementById('main')
)
