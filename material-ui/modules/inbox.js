import React   from 'react'
import TimeAgo from 'react-timeago'

import { connect } 
  from 'react-redux'
import { toggleMessageRead, toggleMessageSelected, toggleMessageFavorite }
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
    const readIcon = (
      <span>
        <Motion defaultStyle={{opacity: 0, zoom: 3}} style={{opacity: 1, zoom: spring(1, { stiffness: 200, damping: 10 })}}>
          {i => (
            <i className='material-icons' style={{
              color     : 'rgb(0, 188, 212)',
              opacity   : i.opacity,
              transform : `scale(${i.zoom})`,
            }}>done</i>
          )}
        </Motion>
      </span>
    )
    return (
      <List>
        {this.renderDialog()}
        <Subheader>SMS Messages</Subheader>
        {visibleMessages.map(message => (
          <div key={message.id}>
            <Divider />
            <ListItem
              onClick            = {() => dispatch(message.read ? toggleMessageSelected(message.id) : toggleMessageRead(message.id))}
              leftAvatar         = {message.read ? readIcon : (
                <i className='material-icons' style={{color: 'rgb(255, 64, 129)'}}>notifications</i>
              )}
              primaryText        = {
                <span>
                  <Checkbox 
                    onCheck = {message.read ? e => e.stopPropagation() : () => dispatch(toggleMessageSelected(message.id))} 
                    checked = {!!message.selected} 
                    style   = {styles.checkbox} 
                  />
                  <span style={styles.source}>
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
                <div style={{marginTop: '8px'}}>
                  {message.read && (
                    <IconButton onClick={e => { dispatch(toggleMessageRead(message.id)) ; e.stopPropagation() }} style={styles.icon} tooltip='Mark as unread'>
                      <i className='material-icons'>flag</i>
                    </IconButton>
                  )}
                  <IconButton onClick={e => e.stopPropagation()} style={styles.icon} tooltip='Reply'>
                    <i className='material-icons'>reply</i>
                  </IconButton>
                  <IconButton onClick={e => e.stopPropagation()} style={styles.icon} tooltip='Forward'>
                    <i className='material-icons'>forward</i>
                  </IconButton>
                  <IconButton 
                    onClick   = {e => { dispatch(toggleMessageFavorite(message.id)) ; e.stopPropagation() }} 
                    style     = {styles.icon}
                    iconStyle = {!!message.favorite ? {color: 'rgb(0, 188, 212)'} : {}}
                    tooltip   = 'Favorite'>
                    <i className='material-icons'>{message.favorite ? 'favorite' : 'favorite_border'}</i>
                  </IconButton>
                  <IconButton onClick={e => e.stopPropagation()} onClick={() => this.setState({confirmDialogVisible: true})} style={styles.icon} tooltip='Delete'>
                    <i className='material-icons'>delete_forever</i>
                  </IconButton>
                </div>
              }
              style = {message.read ? {} : {
                backgroundColor : 'rgba(255, 64, 129, 0.05)',
              }}>
            </ListItem>
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
  source: {
    paddingLeft  : '40px',
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
