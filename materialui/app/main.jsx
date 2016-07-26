import 'babel-polyfill' 

import React, { Component } from 'react'
import ReactDOM, { render } from 'react-dom'

import injectTapEventPlugin 
  from 'react-tap-event-plugin'
import getMuiTheme      
  from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider 
  from 'material-ui/styles/MuiThemeProvider'
import { ReconnectingWebSocket } 
  from 'awesome-websocket'
import { Provider } 
  from 'react-redux'

import store from './store'
import messageHandler from './messagehandler'
import Root from './modules/root.jsx'
import getUrlParam from './urlparams'

const userId  = getUrlParam('user_id') 
const hostUrl = getUrlParam('host_url')  

const ws = new ReconnectingWebSocket(`ws://${hostUrl}/${userId ? `?user_id=${userId}` : ''}`) 

ws.onopen = () => { 
  console.log('WebSocket connection established.') 
  store.dispatch({
    type   : 'APP_UPDATE_STATUS',
    status : 'APP_STATUS_CONNECTED',
  })
}

ws.onclose = () => { 
  console.log('WebSocket connection closed.') 
  store.dispatch({
    type   : 'APP_UPDATE_STATUS',
    status : 'APP_STATUS_ERROR',
    error  : 'WebSocket connection closed by peer.',
  })
} 

ws.onerror = e => { 
  console.error(e)
  store.dispatch({
    type   : 'APP_UPDATE_STATUS',
    status : 'APP_STATUS_ERROR',
    error  : 'Error establishing WebSocket connection.',
  })
}

const parseMessage = (message) => {
  if (message) {
    try {
      return JSON.parse(message)
    } catch (err) {
      console.error(err)
    }
  }
  return null
}

ws.onmessage = (e => { 
  const message = parseMessage(e.data)
  if (message) {
    messageHandler(message.event, message.data)
  }
})

injectTapEventPlugin()

render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <Root sendMessage={(event, data) => ws.send({event, data})} />
    </MuiThemeProvider>
  </Provider>, 
  document.body.appendChild(document.createElement('div'))
)
