import React   from 'react'
import TimeAgo from 'react-timeago'

import { connect } 
  from 'react-redux'
import { markMessageRead, toggleMessageSelected }
  from '../js/actions'

import IconButton 
  from 'material-ui/lib/icon-button'
import List 
  from 'material-ui/lib/lists/list'
import ListItem 
  from 'material-ui/lib/lists/list-item'
import Divider 
  from 'material-ui/lib/divider'
import Subheader 
  from 'material-ui/lib/Subheader'
import Dialog 
  from 'material-ui/lib/dialog'
import FlatButton 
  from 'material-ui/lib/flat-button'
import Checkbox
  from 'material-ui/lib/checkbox'

import { grey400, darkBlack, lightBlack } 
  from 'material-ui/lib/styles/colors'

function messageType(key, read) {
  if ('sms_in' == key) {
    return 'Incoming SMS from'
  } else {
    return 'Outgoing SMS to'
  }
}

class Inbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmDialogVisible : false,
    }
    this.handleCloseDialog = this.handleCloseDialog.bind(this)
  }
  handleCloseDialog() {
    this.setState({
      confirmDialogVisible : false,
    })
  }
  renderDialog() {
    const actions = [
      <FlatButton
        label      = 'Cancel'
        secondary  = {true}
        onTouchTap = {this.handleCloseDialog}
      />,
      <FlatButton
        label      = 'Delete'
        primary    = {true}
        disabled   = {true}
        onTouchTap = {this.handleCloseDialog}
      />,
    ]
    return (
      <Dialog
        title          = 'Confirm action'
        actions        = {actions}
        modal          = {true}
        open           = {this.state.confirmDialogVisible}
        onRequestClose = {this.handleCloseDialog}>
        Do you really want to delete this message?
      </Dialog>
    )
  }
  render() {
    const { inbox : { visibleMessages }, dispatch } = this.props
    return (
      <List>
        {this.renderDialog()}
        <Subheader>SMS Messages</Subheader>
        {visibleMessages.map(message => (
          <div key={message.id}>
            <Divider />
            <ListItem
              onClick            = {() => dispatch(message.read ? toggleMessageSelected(message.id) : markMessageRead(message.id))}
              leftAvatar         = {message.read ? (
                <i className='material-icons' style={{color: 'rgb(0, 188, 212)'}}>done</i>
              ) : (
                <i className='material-icons' style={{color: 'rgb(255, 64, 129)'}}>notifications</i>
              )}
              primaryText        = {
                <span>
                  <Checkbox checked={!!message.selected} style={styles.checkbox} />
                  <span style={{paddingLeft: '40px'}}>
                    {`${messageType(message.type, message.read)} ${message.source}`}
                  </span>
                </span>
              }
              secondaryTextLines = {2}
              secondaryText      = {
                <p style={styles.p}>
                  {!isNaN(message.timestamp) && (
                    <span style={{color: darkBlack}}>
                      <TimeAgo date={Number(message.timestamp)} /> &mdash;&nbsp;
                    </span> 
                  )}
                  {message.content}
                </p>
              }
              rightIconButton = {
                <div style={{marginTop: '10px'}}>
                  <IconButton style={styles.icon} tooltip={message.read ? 'Mark as unread' : 'Mark as read'}>
                    <i className='material-icons'>{message.read ? 'markunread' : 'done'}</i>
                  </IconButton>
                  <IconButton style={styles.icon} tooltip='Reply'>
                    <i className='material-icons'>reply</i>
                  </IconButton>
                  <IconButton style={styles.icon} tooltip='Forward'>
                    <i className='material-icons'>forward</i>
                  </IconButton>
                  <IconButton style={styles.icon} tooltip='Favorite'>
                    <i className='material-icons'>favorite_border</i>
                  </IconButton>
                  <IconButton onClick={() => this.setState({confirmDialogVisible: true})} style={styles.icon} tooltip='Delete'>
                    <i className='material-icons'>delete_forever</i>
                  </IconButton>
                </div>
              }
              style = {message.read ? {} : {
                backgroundColor : 'rgba(255, 64, 129, 0.05)',
              }}
            />
          </div>
        ))}
      </List>
    )
  }
}

const styles = {
  icon: {
    color        : '#757575',
  },
  p: {
    paddingLeft  : '40px',
    paddingRight : '256px',
  },
  checkbox: {
    position     : 'absolute', 
    width        : '15px',
  },
}

const InboxComponent = connect(state => ({
  inbox : state.inbox,
}))(Inbox)

export default InboxComponent
