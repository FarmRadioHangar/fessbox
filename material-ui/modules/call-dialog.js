import React    from 'react'
import ReactDOM from 'react-dom'

import Dialog 
  from 'material-ui/lib/dialog'
import TextField 
  from 'material-ui/lib/text-field'
import FlatButton 
  from 'material-ui/lib/flat-button'
import SelectField 
  from 'material-ui/lib/select-field'
import MenuItem 
  from 'material-ui/lib/menus/menu-item'

import { reduxForm }
  from 'redux-form'

class CallDialog extends React.Component {
  makeCall() {
    const { 
      sendMessage, 
      onClose, 
      fields : { 
        number, 
        channel,
      },
    } = this.props
    sendMessage('callNumber', {
      number     : number.value,
      channel_id : channel.value,
      mode       : 'master',
    })
    onClose()
  }
  render() {
    const { 
      open, 
      onClose, 
      channels, 
      fields : {
        number,
        channel,
      },
      error,
    } = this.props
    const actions = [
      <FlatButton
        label           = 'Cancel'
        secondary       = {true}
        onTouchTap      = {onClose}
      />,
      <FlatButton
        label           = 'Call'
        primary         = {true}
        keyboardFocused = {true}
        onTouchTap      = {::this.makeCall}
        disabled        = {!!(number.error || channel.error)}
      />,
    ]
    const freeChannels = channels.filter(chan => 'free' == chan.mode)
    return (
      <div>
      <Dialog
        title           = {'Make a call'}
        actions         = {actions}
        modal           = {false}
        open            = {open}
        onRequestClose  = {onClose}>
        <SelectField {...channel}
          floatingLabelText = 'Channel'
          onFocus           = {channel.onFocus}        /* onFocus and onBlur events are not firing. */
          onBlur            = {channel.onBlur}         /* See: https://github.com/callemall/material-ui/issues/3151 */
          onChange          = {(e, i) => channel.onChange(freeChannels[i].id)}
          errorText         = {channel.touched && channel.error}
          style             = {{width: '100%'}}>
          {freeChannels.map((chan, i) => 
            <MenuItem 
              key           = {i}
              value         = {chan.id}
              primaryText   = {chan.id} />
          )} 
        </SelectField>
        <TextField {...number}
          floatingLabelText = 'Number'
          hintText          = 'Number to call'
          fullWidth         = {true}
          errorText         = {number.touched && number.error}
        />
      </Dialog>
      </div>
    )
  }
}

function validatePhoneNumber(number) {
  return /^(\+?[0-9]{1,3}\-?|0)[0123456789]{9}$/.test(number)
}

const validate = values => {
  let errors = {}
  if (!values.channel) {
    errors.channel = 'You must select a channel'
  }
  if (!validatePhoneNumber(values.number)) {
    errors.number = 'Not a valid phone number'
  }
  return errors
}

export default reduxForm({ 
  form   : 'callOut',                           
  fields : ['number', 'channel'],
  validate,
})(CallDialog)
