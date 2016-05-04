import React     from 'react'
import _         from 'lodash'
import Dashboard from './dashboard'

import { 
  APP_STATUS_CONNECTED, 
  APP_STATUS_CONNECTING, 
  APP_STATUS_ERROR,
  APP_STATUS_INITIALIZED,
} from '../js/constants'

import { connect } 
  from 'react-redux'
import CircularProgress 
  from 'material-ui/CircularProgress'
import Dialog 
  from 'material-ui/Dialog'

class Ui extends React.Component {
  render() {
    const { 
      app : { status, error }, 
      sendMessage,
    } = this.props
    switch (status) {
      case APP_STATUS_CONNECTING:
      case APP_STATUS_CONNECTED:
        const backgroundColor = (APP_STATUS_CONNECTING == status) ? 'white' : 'transparent'
        return (
          <div style={{backgroundColor, ...styles.spinner}}>
            <CircularProgress size={1} />
          </div>
        )
      case APP_STATUS_INITIALIZED:
        return (
          <Dashboard sendMessage={sendMessage} />
        )
      case APP_STATUS_ERROR:
      default:
        return (
          <Dialog
            title   = 'Application error'
            actions = {[]}
            modal   = {true}
            open    = {true}>
            {error}
          </Dialog>
        )
    }
  }
}

const styles = {
  spinner: {
    width            : '100%',
    height           : '100%',
    display          : 'flex',
    justifyContent   : 'center',
    alignItems       : 'center',
    WebkitTransition : 'background-color 2s',
    transition       : 'background-color 2s',
  }
}

export default connect(state => _.pick(state, ['app']))(Ui)
