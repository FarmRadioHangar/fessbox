import React    from 'react'
import ReactDOM from 'react-dom'

import Dialog 
  from 'material-ui/lib/dialog'
import TextField 
  from 'material-ui/lib/text-field'
import AutoComplete 
  from 'material-ui/lib/auto-complete'
import FlatButton 
  from 'material-ui/lib/flat-button'

class SendMessageDialog extends React.Component {
  constructor(props) {
    super(props)
  }
  handleUpdate() {
    const text = this.refs.autoComplete.state.searchText
    this.props.sendMessage('addrBookSuggestions', text)
  }
  render() {
    const { open, onClose } = this.props
    const actions = [
      <FlatButton
        label           = 'Cancel'
        secondary       = {true}
        onTouchTap      = {onClose}
      />,
      <FlatButton
        label           = 'Send'
        primary         = {true}
        keyboardFocused = {true}
        onTouchTap      = {onClose}
      />,
    ]
    return (
      <Dialog
        title          = 'Send'
        actions        = {actions}
        modal          = {false}
        open           = {open}
        onRequestClose = {() => {}}>
        <AutoComplete
          ref               = 'autoComplete'
          hintText          = 'Type a contact name or phone number'
          dataSource        = {['Bob', 'Alice', 'Knuth', 'Greg', 'Alex', 'Adrian']}
          onUpdateInput     = {this.handleUpdate.bind(this)}
          floatingLabelText = 'Recepient'
          fullWidth         = {true}
        />
        <TextField
          hintText          = 'Message content'
          fullWidth         = {true}
          multiLine         = {true}
          rows              = {3} 
        />
      </Dialog>
    )
  }
}

export default SendMessageDialog
