// @flow
import React, { Component } from 'react'
import ReactDOM, { render } from 'react-dom'
import { connect } from 'react-redux'

import Dialog 
  from 'material-ui/Dialog'
import FlatButton 
  from 'material-ui/FlatButton'
import TextField 
  from 'material-ui/TextField'
import SelectField 
  from 'material-ui/SelectField'
import MenuItem 
  from 'material-ui/MenuItem'
import RadioButton
  from 'material-ui/RadioButton'
import RadioButtonGroup
  from 'material-ui/RadioButton/RadioButtonGroup'
import Subheader
  from 'material-ui/Subheader/Subheader'

class CallDialog extends Component {
  
  state: {
    callMode    : string,
    channel     : string,
    phoneNumber : string,
    errors      : Object,
  }

  props: {
    onClose   : Function,
    onConfirm : Function,
  }

  initialState(): Object {
    return {
      callMode    : 'master',
      channel     : null,
      phoneNumber : '',
      errors: {
        phoneNumber: null,
      },
    }
  }

  constructor(props: string) {
    super(props)
    this.state = this.initialState()
    this.handleCallModeChange    = this.handleCallModeChange.bind(this)
    this.handleChannelChange     = this.handleChannelChange.bind(this)
    this.handlePhoneNumberChange = this.handlePhoneNumberChange.bind(this)
  }
 
  validatePhoneNumber(value: string): void {
    if (!value.length) {
      return 'This field is required.'
    }
    return null
  }

  handlePhoneNumberChange(e): void {
    this.setState({
      errors: {
        ...this.state.errors, 
        phoneNumber: this.validatePhoneNumber(e.target.value),
      },
      phoneNumber: e.target.value,
    })
  }

  handleChannelChange(e): void {
    this.setState({
      channel: e.target.value,
    })
  }

  handleCallModeChange(e, index, value): void {
    this.setState({
      callMode : value,
    })
  }

  hasErrors(): bool {
    const { errors } = this.state
    for (let key in errors) {
      if (null !== errors[key]) {
        return true
      }
    }
    return false
  }

  componentWillReceiveProps(props): void {
    if (false === props.open) {
      this.setState(this.initialState())
    } else if (false === this.props.open) {
      if (null !== props.phoneNumber) {
        this.setState({
          phoneNumber : props.phoneNumber,
        })
      }
    }
  }

  render() {

    const { onClose, onConfirm, open, channels, userChanFree } = this.props

    const actions = [
      <FlatButton
        label           = 'Cancel'
        secondary       = {true}
        onTouchTap      = {onClose}
      />,
      <FlatButton
        label           = 'Call'
        disabled        = {this.hasErrors() || !this.state.phoneNumber}
        primary         = {true}
        keyboardFocused = {true}
        onTouchTap      = {() => {
          const { callMode, channel, phoneNumber } = this.state
          onConfirm({
            number     : phoneNumber,
            channel_id : ('auto' == channel ? null : channel),
            mode       : callMode,
          })
        }}
      />,
    ]

    return (
      <Dialog
        title           = {'Make a call'}
        actions         = {actions}
        modal           = {false}
        open            = {open}
        onRequestClose  = {() => {}}>
        <Subheader style={{padding: 0}}>Channel</Subheader>
        <RadioButtonGroup 
          name            = 'Channel' 
          defaultSelected = 'auto'
          onChange        = {this.handleChannelChange}>
          <RadioButton
            key   = {'auto'}
            value = {'auto'}
            label = {'Auto select'} 
          />
          {channels.map((chan, i) => (
            <RadioButton
              key   = {i}
              value = {chan.id}
              label = {chan.id} 
            />
          ))}
        </RadioButtonGroup>
        {userChanFree && (
          <SelectField 
            fullWidth         = {true}
            floatingLabelText = 'Call mode'
            value             = {this.state.callMode}
            onChange          = {this.handleCallModeChange}>
            <MenuItem 
              value       = {'master'}
              primaryText = 'On Air (Master)' 
            />
            <MenuItem 
              value       = {'private'}
              primaryText = 'Private'
            />
          </SelectField>
        )}
        <TextField 
          errorText         = {this.state.errors.phoneNumber}
          floatingLabelText = 'Phone number'
          value             = {this.state.phoneNumber}
          hintText          = 'Number to call'
          fullWidth         = {true} 
          onChange          = {this.handlePhoneNumberChange}
        />
      </Dialog>
    )
  }

}

export default CallDialog
