import React, { Component } from 'react'
import ChannelSelect from './channel-select'
import MaterialField from './material-field'
import validators    from './validators'
import _             from 'lodash'

import { connect }  
  from 'react-redux'
import { getField } 
  from 'react-redux-form'

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

class CallDialog extends Component {
  makeCall() {
    const { 
      call,
      onClose, 
      sendMessage, 
    } = this.props
    var mode
    switch (call.mode) {
      case 1:
        mode = 'private'
        break
      default:
        mode = 'master'
    }
    sendMessage('callNumber', {
      number     : call.number,
      channel_id : ('auto' === call.channel) ? null : call.channel.id,
      mode,
    })
    onClose()
  }
  render() {
    const { 
      call,
      callForm,
      channels, 
      onClose, 
      open, 
      mixer : { userChanFree },
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
          <ChannelSelect 
            channels    = {freeChannels} 
          />
        </MaterialField>
        {userChanFree && (
          <MaterialField 
            model         = 'call.mode'>
            <SelectField 
              fullWidth         = {true}
              floatingLabelText = 'Call mode'
              defaultValue      = 'master'>
              <MenuItem value={0} primaryText='On Air (Master)' />
              <MenuItem value={1} primaryText='Private' />
            </SelectField>
          </MaterialField>
        )}
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

export default connect(state => _.pick(state, ['call', 'callForm', 'mixer']))(CallDialog)
