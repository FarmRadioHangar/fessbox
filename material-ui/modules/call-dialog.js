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
  render() {
    const { 
      open, 
      onClose, 
      channels, 
      fields : {
        number,
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
        onTouchTap      = {onClose}
	disabled        = {!!(number.error)}
      />,
    ]
    return (
      <Dialog
        title          = {'Make a call'}
        actions        = {actions}
        modal          = {false}
        open           = {open}
        onRequestClose = {onClose}>
        <SelectField 
          floatingLabelText = 'SIM card'
          style             = {{width: '100%'}}
          value             = {1} 
          onChange          = {() => {}}>
          {channels.filter(chan => 'free' == chan.mode).map((channel, i) => 
            <MenuItem 
              key           = {i}
              value         = {i}
              primaryText   = {channel.id} />
          )} 
        </SelectField>
        <TextField {...number}
          floatingLabelText = 'Number'
          hintText          = 'Number to call'
          fullWidth         = {true}
          errorText         = {number.touched && number.error}
        />
      </Dialog>
    )
  }
}

function validatePhoneNumber(number) {
  return /^(\+?[0-9]{1,3}\-?|0)[0123456789]{9}$/.test(number)
}

const validate = values => {
  let errors = {}
  if (!validatePhoneNumber(values.number)) {
    errors.number = 'Not a valid phone number'
  }
  return errors
}

export default reduxForm({ 
  form   : 'callOut',                           
  fields : ['number'],
  validate,
})(CallDialog)
