import React         from 'react'
import ChannelSelect from './channel-select'
import MaterialField from './material-field'
import validators    from './validators'
import _             from 'lodash'

import Dialog 
  from 'material-ui/Dialog'
import TextField 
  from 'material-ui/TextField'
import FlatButton 
  from 'material-ui/FlatButton'
import SelectField 
  from 'material-ui/SelectField'
import MenuItem 
  from 'material-ui/MenuItem'

import { connect } 
  from 'react-redux'
import { getField } 
  from 'react-redux-form'

class CallDialog extends React.Component {
  makeCall() {
    const { 
      sendMessage, 
      onClose, 
      call,
    } = this.props
    sendMessage('callNumber', {
      number     : call.number,
      channel_id : ('auto' === call.channel) ? null : call.channel.id,
      mode       : 'master',
    })
    onClose()
  }
  render() {
    const { 
      open, 
      onClose, 
      channels, 
      call,
      callForm,
    } = this.props
    const actions = [
      <FlatButton
        label           = 'Cancel'
        secondary       = {true}
        onTouchTap      = {onClose}
      />,
      <FlatButton
        label           = 'Call'
        disabled        = {callForm.pristine || !callForm.valid}
        primary         = {true}
        keyboardFocused = {true}
        onTouchTap      = {::this.makeCall}
      />,
    ]
    const freeChannels = channels.filter(chan => 'free' == chan.mode)
    const errorText = (errors) => {
      if (errors.required) {
        return 'This field is required.'
      } else if (errors.phoneNumber) {
        return 'Not a valid phone number.'
      } else if (errors.messageLength) {
        return 'Message is too long.'
      }
    }
    return (
      <Dialog
        title           = {'Make a call'}
        actions         = {actions}
        modal           = {false}
        open            = {open}
        onRequestClose  = {onClose}>
        <MaterialField 
          validators    = {_.pick(validators, ['required'])}
          model         = 'call.channel'>
          <ChannelSelect channels={freeChannels} />
        </MaterialField>
        <MaterialField 
          validators    = {_.pick(validators, ['required', 'phoneNumber'])}
          model         = 'call.number'>
          <TextField 
            errorText         = {errorText(getField(callForm, 'number').errors)}
            errorStyle        = {validators.isPartial(call.number) ? {color: 'orange'} : {}}
            floatingLabelText = 'Phone number'
            hintText          = 'Number to call'
            fullWidth         = {true} />
        </MaterialField>
      </Dialog>
    )
  }
}

export default connect(state => _.pick(state, ['call', 'callForm']))(CallDialog)
