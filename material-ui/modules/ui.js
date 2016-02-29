import React from 'react'
import App   from './app'

import { 
  WS_STATUS_CONNECTING, 
  WS_STATUS_CONNECTED, 
  WS_STATUS_ERROR 
} from '../js/constants'

import { connect } 
  from 'react-redux'
import CircularProgress 
  from 'material-ui/lib/circular-progress'
import Dialog 
  from 'material-ui/lib/dialog'

class Ui extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { 
      app : { status, error }, 
      sendMessage,
    } = this.props
    switch (status) {
      case WS_STATUS_CONNECTING:
        return (
          <div style={styles.spinner}>
            <CircularProgress size={1} />
          </div>
        )
      case WS_STATUS_CONNECTED:
        return (
          <App sendMessage={sendMessage} />
        )
      case WS_STATUS_ERROR:
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
    width          : '100%',
    height         : '100%',
    display        : 'flex',
    justifyContent : 'center',
    alignItems     : 'center',
  }
}

const UiComponent = connect(state => ({
  app : state.app,
}))(Ui)

export default UiComponent
