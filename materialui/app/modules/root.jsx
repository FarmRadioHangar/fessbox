import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import Dashboard from './dashboard.jsx'

import CircularProgress 
  from 'material-ui/CircularProgress'
import Dialog 
  from 'material-ui/Dialog'

class Root extends Component {
  render() {

    const styles = {
      spinner: {
        width            : '100%',
        height           : '100%',
        display          : 'flex',
        justifyContent   : 'center',
        alignItems       : 'center',
        WebkitTransition : 'opacity 2s',
        transition       : 'opacity 2s',
        marginTop        : '200px',
      }
    }
    
    const { 
      app, 
      sendMessage,
    } = this.props

    switch (app.status) {
      case 'APP_STATUS_CONNECTING':
      case 'APP_STATUS_CONNECTED':
        return (
          <div style={{...styles.spinner}}>
            <CircularProgress size={1} />
          </div>
        )
      case 'APP_STATUS_INITIALIZED':
        return (
          <Dashboard sendMessage={sendMessage} />
        )
      case 'APP_STATUS_ERROR':
      default:
        return (
          <Dialog
            title   = 'Application error'
            actions = {[]}
            modal   = {true}
            open    = {true}>
            {app.error}
          </Dialog>
        )
    }
  }
}

export default connect(state => _.pick(state, ['app']))(Root)
