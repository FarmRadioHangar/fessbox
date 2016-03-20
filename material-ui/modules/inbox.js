import React   from 'react'
import TimeAgo from 'react-timeago'

import { connect } 
  from 'react-redux'
import { toggleMessageRead, toggleMessageSelected, toggleMessageFavorite, removeMessage }
  from '../js/actions'
import { TransitionMotion, Motion, spring, presets } 
  from 'react-motion'

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
import Paper
  from 'material-ui/lib/paper'

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
      confirmDeleteMessage : null,
    }
    this.handleCloseDialog = this.handleCloseDialog.bind(this)
  }
  handleCloseDialog() {
    this.setState({
      confirmDeleteMessage : null,
    })
  }
  handleConfirmDelete() {
    const { dispatch, sendMessage } = this.props
    const id = this.state.confirmDeleteMessage
    this.handleCloseDialog()
    sendMessage('messageDelete', { 
      [id]: null
    })
    dispatch(removeMessage(id))
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
        onTouchTap = {this.handleConfirmDelete.bind(this)}
      />,
    ]
    return (
      <Dialog
        title          = 'Confirm action'
        actions        = {actions}
        modal          = {true}
        open           = {!!this.state.confirmDeleteMessage}
        onRequestClose = {this.handleCloseDialog}>
        Do you really want to delete this message?
      </Dialog>
    )
  }
  render() {
    const { inbox : { visibleMessages, messageCount, unreadCount }, dispatch } = this.props
    const readIcon = (
      <span>
        <Motion defaultStyle={{opacity: 0, zoom: 3}} style={{opacity: 1, zoom: spring(1, { stiffness: 200, damping: 10 })}}>
          {i => (
            <i className='material-icons' style={{
              color     : '#aed581',
              opacity   : i.opacity,
              transform : `scale(${i.zoom})`,
            }}>check</i>
          )}
        </Motion>
      </span>
    )
    const unreadIcon = (
      <i className='material-icons' style={{color: 'rgb(255, 64, 129)'}}>notifications</i>
    )
    if (!messageCount) {
      return (
        <List>
          <Subheader>SMS Messages</Subheader>
          <Divider />
          <p style={{padding: '16px'}}>No messages.</p>
        </List>
      )
    }
    return (
      <List>
        {this.renderDialog()}
        <Subheader>{`SMS Messages (${unreadCount}/${messageCount})`}</Subheader>
        {visibleMessages.map(message => (
          <div key={message.id}>
            <Divider />
            <ListItem
              onClick            = {() => dispatch(message.read ? toggleMessageSelected(message.id) : toggleMessageRead(message.id))}
              leftAvatar         = {message.read ? readIcon : unreadIcon}
              primaryText        = {message.source}
              secondaryTextLines = {2}
              secondaryText      = {
                <div style={styles.secondary}>
                  {!isNaN(message.timestamp) && (
                    <span style={{color: darkBlack}}>
                      <TimeAgo date={Number(message.timestamp)} /> &mdash;&nbsp;
                    </span> 
                  )}
                  {message.content}
                </div>
              }
              rightIconButton = {
                <div style={{zIndex: 9999}}>
                  {message.read && (
                    <IconButton onClick={e => { dispatch(toggleMessageRead(message.id)) ; e.stopPropagation() }} style={styles.icon} tooltip='Mark as unread'>
                      <i className='material-icons'>new_releasese</i>
                    </IconButton>
                  )}
                  <IconButton onClick={ e => { this.props.onReply(message) ; e.stopPropagation() }} style={styles.icon} tooltip='Reply'>
                    <i className='material-icons'>reply</i>
                  </IconButton>
                  <IconButton onClick={ e => { this.props.onForward(message) ; e.stopPropagation() } } style={styles.icon} tooltip='Forward'>
                    <i className='material-icons'>forward</i>
                  </IconButton>
                  <IconButton 
                    onClick   = {e => { dispatch(toggleMessageFavorite(message.id)) ; e.stopPropagation() }} 
                    style     = {styles.icon}
                    iconStyle = {!!message.favorite ? {color: 'rgb(0, 188, 212)'} : {}}
                    tooltip   = 'Favorite'>
                    <i className='material-icons'>{message.favorite ? 'favorite' : 'favorite_border'}</i>
                  </IconButton>
                  <IconButton 
                    onClick   = {e => { this.setState({confirmDeleteMessage: message.id}) ; e.stopPropagation() }} 
                    style     = {styles.icon} 
                    tooltip   = 'Delete'>
                    <i className='material-icons'>delete_forever</i>
                  </IconButton>
                </div>
              }
              style = {{
                backgroundColor : message.read ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 64, 129, 0.05)',
                paddingLeft     : '0',
              }} />
          </div>
        ))}
      </List>
    )
  }
}

const styles = {
  icon: {
    color             : '#757575',
  },
  secondary: {
    paddingRight      : '256px',
  },
  checkbox: {
    position          : 'absolute', 
    width             : '15px',
  },
}

const InboxComponent = connect(state => ({
  inbox : state.inbox,
}))(Inbox)

export default InboxComponent
