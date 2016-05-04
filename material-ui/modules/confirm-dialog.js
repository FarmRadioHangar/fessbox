import React         from 'react'
import _             from 'lodash'

import { connect } 
  from 'react-redux'

import Dialog 
  from 'material-ui/Dialog'
import FlatButton 
  from 'material-ui/FlatButton'

class ConfirmDialog extends React.Component {
  render() {
    const { 
      open, 
      onClose, 
      onConfirm,
      app : { dialogState },
    } = this.props
    const actions = [
      <FlatButton
        label           = 'Cancel'
        secondary       = {true}
        onTouchTap      = {onClose}
      />,
      <FlatButton
        label           = 'Ok'
        primary         = {true}
        onTouchTap      = {() => onConfirm(dialogState.messageId)}
      />,
    ]
    return (
      <Dialog
        title           = {'Delete the message?'}
        actions         = {actions}
        modal           = {true}
        open            = {open}
        onRequestClose  = {onClose}>
      </Dialog>
    )
  }
}

export default connect(state => _.pick(state, ['app']))(ConfirmDialog)
