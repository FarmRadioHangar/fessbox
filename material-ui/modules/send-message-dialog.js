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
import SelectField 
  from 'material-ui/lib/select-field'
import MenuItem 
  from 'material-ui/lib/menus/menu-item'
import Subheader 
  from 'material-ui/lib/Subheader'

function getTitle(dialog) {
  switch (dialog) {
    case 'reply-to-message':
      return 'Reply to message'
    case 'forward-message':
      return 'Forward message'
    case 'send-message':
    default:
      return 'Send message'
  }
}

class SendMessageDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      messageContent: '',
    }
  }
  handleUpdate() {
    const text = this.refs.autoComplete.state.searchText
    this.props.sendMessage('addrBookSuggestions', text)
  }
  handleConfirm() {
    const { sendMessage } = this.props
    const key = Date.now()
    const payload = {
      [key]: {
	type : 'sms_out',
	endpoint   : '',
	content    : '',
	channel_id : '',
      }
    }
    console.log(payload)
    //sendMessage('messageSend', payload)
  }
  handleChangeContent() {
  }
  renderFormFields() {
    const { dialog, message, channels } = this.props
    const simSelect = (
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
    )
    switch (dialog) {
      case 'forward-message':
        return (
          <div>
            {simSelect}
            <AutoComplete
              ref               = 'autoComplete'
              hintText          = {'Recipient\'s phone number'}
              dataSource        = {['Bob', 'Alice', 'Knuth', 'Greg', 'Alex', 'Adrian']}
              onUpdateInput     = {::this.handleUpdate)}
              floatingLabelText = 'Send to'
              fullWidth         = {true}
            />
            <TextField
              defaultValue      = {message.content}
              floatingLabelText = 'Message content'
              hintText          = 'Forwarded message'
              fullWidth         = {true}
              multiLine         = {true}
              rows              = {3} 
            />
            <div>Characters remaining: 255</div>
          </div>
        )
      case 'reply-to-message':
        return (
          <div>
            <TextField
              disabled          = {true}
              value             = {message.content}
              floatingLabelText = 'Original message'
              fullWidth         = {true}
              multiLine         = {true}
              rows              = {3} 
            />
            {simSelect}
            <TextField
              disabled          = {true}
              value             = {message.endpoint}
              floatingLabelText = 'Send to'
              fullWidth         = {true}
            />
            <TextField
              floatingLabelText = 'Your reply'
              hintText          = 'Type your message here'
              fullWidth         = {true}
              multiLine         = {true}
              rows              = {3} 
            />
            <div>Characters remaining: 255</div>
          </div>
        )
      case 'send-message':
        return (
          <div>
            {simSelect}
            <AutoComplete
              ref               = 'autoComplete'
              hintText          = {'Recipient\'s phone number'}
              dataSource        = {['Bob', 'Alice', 'Knuth', 'Greg', 'Alex', 'Adrian']}
              onUpdateInput     = {::this.handleUpdate}
              floatingLabelText = 'Send to'
              fullWidth         = {true}
            />
            <TextField
              floatingLabelText = 'Message content'
              hintText          = 'Type your message here'
              fullWidth         = {true}
              multiLine         = {true}
              rows              = {3} 
	      value             = {this.state.messageContent}
	      onBlur            = {::this.handleChangeContent}
            />
            <div>Characters remaining: 240</div>
          </div>
        )
    }
  }
  render() {
    const { open, onClose, dialog } = this.props
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
        onTouchTap      = {::this.handleConfirm}
      />,
    ]
    /*
    const originalMessage = message ? (
      <TextField
        floatingLabelText = 'Original message'
        disabled          = {true}
        fullWidth         = {true}
        multiLine         = {true}
        value             = {message.content}
        rows              = {3} 
      />
    ) : <span />
    */
    return (
      <Dialog
        title          = {getTitle(dialog)}
        actions        = {actions}
        modal          = {false}
        open           = {open}
        onRequestClose = {onClose}>
        {::this.renderFormFields()}
      </Dialog>
    )
  }
}

export default SendMessageDialog
