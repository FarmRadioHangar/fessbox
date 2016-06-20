import React, { Component } from 'react'
import ChannelSelect from './channel-select'
import MaterialField from './material-field'
import validators    from './validators'
import _             from 'lodash'

import Dialog 
  from 'material-ui/Dialog'
import FlatButton 
  from 'material-ui/FlatButton'
import TextField 
  from 'material-ui/TextField'

import { connect } 
  from 'react-redux'
import { getField } 
  from 'react-redux-form'

let count = 1

class SmsDialog extends Component {
  handleSubmit(e) {
    e.preventDefault()
    const { sms, onClose, sendMessage } = this.props
    const id = Date.now()+String(count++%99999)
    let payload = { 
      type       : 'sms_out',
      endpoint   : sms.recipient,
      content    : sms.content,
      channel_id : ('auto' === sms.channel) ? null : sms.channel.id,
    }
    if (sms.message) {
      payload.reply_to = sms.message.id
    }
    sendMessage('messageSend', { [id]: payload })
    onClose()
  }
  render() {
    const { 
      channels,
      onClose, 
      open, 
      sms,
      smsForm,
    } = this.props

    //console.log(sms)
    //console.log(smsForm)

    const actions = [
      <FlatButton
        label           = 'Cancel'
        secondary       = {true}
        onTouchTap      = {onClose}
      />,
      <FlatButton
        label           = 'Send'
        disabled        = {smsForm.pristine || !smsForm.valid || !smsForm.fields.recipient || smsForm.fields.recipient.pristine}
        primary         = {true}
        keyboardFocused = {true}
        onTouchTap      = {::this.handleSubmit}
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
        title            = {sms.message ? 'Reply to message' : 'Send SMS'}
        actions          = {actions}
        modal            = {false}
        open             = {open}
        onRequestClose   = {onClose}>
        <MaterialField 
          validators = {_.pick(validators, ['required'])}
          model      = 'sms.channel'>
          <ChannelSelect channels={freeChannels} />
        </MaterialField>
        <MaterialField 
          validators = {_.pick(validators, ['required', 'phoneNumber'])}
          model      = 'sms.recipient'>
          <TextField 
            errorText         = {errorText(getField(smsForm, 'recipient').errors)}
            errorStyle        = {validators.isPartial(sms.recipient) ? {color: 'orange'} : {}}
            floatingLabelText = 'Send to'
            hintText          = {'Recipient\'s phone number'}
            fullWidth         = {true} />
        </MaterialField>
        {sms.message && (
          <TextField 
            floatingLabelText = 'Original message'
            fullWidth         = {true}
            multiLine         = {true}
            disabled          = {true}
            value             = {sms.message.content}
            rows              = {3} />
        )}
        <MaterialField 
          validators = {{ 
            //required      : validators.required,
            messageLength : validators.maxLength(160), 
          }}
          model      = 'sms.content'>
          <TextField 
            errorText         = {errorText(getField(smsForm, 'content').errors)}
            floatingLabelText = 'Message content'
            hintText          = 'Type your message here'
            fullWidth         = {true}
            multiLine         = {true}
            rows              = {3} />
        </MaterialField>
        <div>
          {sms.content && sms.content.length <= 160 && (
            <div>Characters remaining: {160 - sms.content.length}</div>
          )}
        </div>
      </Dialog>
    )
  }
}

export default connect(state => _.pick(state, ['sms', 'smsForm']))(SmsDialog)
