import React    from 'react'
import TimeAgo  from 'react-timeago'
import ReactList from 'react-list'

import { connect } 
  from 'react-redux'
import { toggleMessageRead, toggleMessageSelected, toggleMessageFavorite, removeMessage }
  from '../js/actions'
import { TransitionMotion, Motion, spring, presets } 
  from 'react-motion'

import IconButton 
  from 'material-ui/lib/icon-button'
import Divider 
  from 'material-ui/lib/divider'
import Subheader 
  from 'material-ui/lib/Subheader'
import Dialog 
  from 'material-ui/lib/dialog'
import FlatButton 
  from 'material-ui/lib/flat-button'

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
        onTouchTap = {::this.handleCloseDialog}
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
        onRequestClose = {::this.handleCloseDialog}>
        Do you really want to delete this message?
      </Dialog>
    )
  }
  renderItem(index, key) {
    const { inbox : { visibleMessages }, dispatch } = this.props
    const message = visibleMessages[index]
    const readIcon = (
      <span>
        <i className='material-icons' style={{color: '#aed581'}}>check</i>
      </span>
    )
    const unreadIcon = (
      <i className='material-icons' style={{color: 'rgb(255, 64, 129)'}}>notifications</i>
    )
    return (
      <div key={key} style={{
        width           : '100%',
        height          : '80px',
      }}>
        <div 
          onClick = {() => dispatch(message.read ? toggleMessageSelected(message.id) : toggleMessageRead(message.id))} 
          style   = {{
            height          : '80px',
            paddingRight    : '300px',
            backgroundColor : message.read ? 'rgb(255, 255, 255)' : 'rgba(255, 64, 129, 0.05)',
          }}>
          <div style={{
            textAlign : 'right',
            position  : 'absolute',
            right     : 0,
            overflow  : 'hidden',
            width     : '300px',
            height    : '80px'
          }}>
            {message.read && (
              <IconButton onClick={e => { dispatch(toggleMessageRead(message.id)) }} style={styles.icon} tooltip='Mark as unread'>
                <i className='material-icons'>new_releasese</i>
              </IconButton>
            )}
            <IconButton onClick={ e => { this.props.onReply(message) }} style={styles.icon} tooltip='Reply'>
              <i className='material-icons'>reply</i>
            </IconButton>
            <IconButton onClick={ e => { this.props.onForward(message) } } style={styles.icon} tooltip='Forward'>
              <i className='material-icons'>forward</i>
            </IconButton>
            <IconButton 
              onClick   = {e => { dispatch(toggleMessageFavorite(message.id))  }} 
              style     = {styles.icon}
              iconStyle = {!!message.favorite ? {color: 'rgb(0, 188, 212)'} : {}}
              tooltip   = 'Favorite'>
              <i className='material-icons'>{message.favorite ? 'favorite' : 'favorite_border'}</i>
            </IconButton>
            <IconButton 
              onClick   = {e => { this.setState({confirmDeleteMessage: message.id}) }} 
              style     = {styles.icon} 
              tooltip   = 'Delete'>
              <i className='material-icons'>delete_forever</i>
            </IconButton>
          </div>
          <span style={{position: 'absolute', padding: '10px'}}>
            {message.read ? readIcon : unreadIcon}
          </span>
          <div style={{padding: '10px 10px 10px 50px', lineHeight: '19px'}}>
            <div>
              {message.source}
            </div>
            <div style={styles.secondary}>
              {!isNaN(message.timestamp) && (
                <span style={{color: darkBlack}}>
                  <TimeAgo date={Number(message.timestamp)} /> &mdash;&nbsp;
                </span> 
              )}
              {message.content}
            </div>
          </div>
        </div>
        <Divider />
      </div>
    )
  }
  render() {
    const { inbox : { visibleMessages, messageCount, unreadCount }, dispatch } = this.props
    return (
      <div style={{backgroundColor: '#ffffff'}}>
        {this.renderDialog()}
        <Subheader>{`SMS Messages (${unreadCount}/${messageCount})`}</Subheader>
        <Divider />
        <ReactList
          itemRenderer = {::this.renderItem}
          length       = {visibleMessages.length}
          type         = 'uniform'
        />
      </div>
    )
  }
}

const styles = {
  icon: {
    color             : '#757575',
  },
  secondary: {
    fontSize          : '14px',
    color             : 'rgba(0, 0, 0, 0.54)',
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
