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

class CallDialog extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { open, onClose, channels } = this.props
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
          {channels.map((channel, i) => (
            <MenuItem 
              key           = {i}
              value         = {i}
              primaryText   = {channel.id} />
          ))} 
        </SelectField>
        <TextField
          floatingLabelText = 'Number'
          hintText          = 'Number to call'
          fullWidth         = {true}
        />
      </Dialog>
    )
  }
}

export default CallDialog
