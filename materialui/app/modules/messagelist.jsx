// @flow
import React, { Component } from 'react'
import ReactDOM, { render } from 'react-dom'
import { connect }          from 'react-redux'
import Infinite             from 'react-infinite'
import _                    from 'lodash'
import                           'datejs'

import { 
  Icon, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAction, 
  ListItemContent, 
  Menu, 
  MenuItem,
} from 'react-mdl'

import Checkbox
  from 'material-ui/Checkbox'
import Dialog 
  from 'material-ui/Dialog'
import FlatButton 
  from 'material-ui/FlatButton'
import FloatingActionButton 
  from 'material-ui/FloatingActionButton'
import TextField 
  from 'material-ui/TextField'
import Subheader
  from 'material-ui/Subheader/Subheader'
import RadioButton
  from 'material-ui/RadioButton'
import RadioButtonGroup
  from 'material-ui/RadioButton/RadioButtonGroup'

import CallDialog from './calldialog.jsx'

const formatDate = (ts) => (new Date(Number(ts))).toString('MMM dd H:mm')

class SendSMSDialog extends Component {

  state: {
    charsRemaining : number,
    content        : string,
    phoneNumber    : string,
    channel        : string,
    errors         : Object,
  }

  initialState(): Object {
    return {
      charsRemaining: 160,
      content: '',
      phoneNumber: '',
      channel: null,
      errors: {
        content: null,
        phoneNumber: null,
      },
    }
  }

  constructor(props: Object) {
    super(props)
    this.state = this.initialState()
    this.handleMessageTextChange = this.handleMessageTextChange.bind(this)
    this.handlePhoneNumberChange = this.handlePhoneNumberChange.bind(this)
    this.handleChannelChange     = this.handleChannelChange.bind(this)
    this.hasErrors               = this.hasErrors.bind(this)
  }

  handleChannelChange(e): void {
    this.setState({
      channel: e.target.value,
    })
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

  validateMessageContent(value: string): void {
    if (value.length > 160) {
      return 'Message too long.'
    }
    return null
  }

  handleMessageTextChange(e): void {
    let charsRemaining = 0 
    const len = e.target.value.length
    if (len <= 160) {
      charsRemaining = 160-len
    } 
    this.setState({
      errors: {
        ...this.state.errors, 
        content: this.validateMessageContent(e.target.value),
      },
      charsRemaining,
      content : e.target.value,
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
      if (null !== props.replyToNumber) {
        this.setState({
          phoneNumber : props.replyToNumber,
        })
      }
    }
  }

  render() {

    const { 
      channels,
      onClose, 
      onConfirm, 
      open, 
    } = this.props

    const actions = [
      <FlatButton
        label           = 'Cancel'
        secondary       = {true}
        onTouchTap      = {onClose}
      />,
      <FlatButton
        label           = 'Send'
        disabled        = {this.hasErrors() || !this.state.phoneNumber}
        primary         = {true}
        keyboardFocused = {true}
        onTouchTap      = {() => { 
          const { content, phoneNumber, channel } = this.state
          onConfirm({ 
            content, 
            phoneNumber,
            channel : ('auto' == channel ? null : channel)
          }) 
        }}
      />,
    ]
  
    return (
      <Dialog
        title           = {'Send SMS'}
        actions         = {actions}
        modal           = {true}
        open            = {open}
        onRequestClose  = {onClose}>
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
        <TextField 
          errorText         = {this.state.errors.phoneNumber}
          floatingLabelText = 'Send to'
          hintText          = {'Recipient\'s phone number'}
          fullWidth         = {true} 
          onChange          = {this.handlePhoneNumberChange}
          value             = {this.state.phoneNumber}
        />
        <TextField 
          errorText         = {this.state.errors.content}
          floatingLabelText = 'Message content'
          hintText          = 'Type your message here'
          fullWidth         = {true}
          multiLine         = {true}
          onChange          = {this.handleMessageTextChange}
          rows              = {3} 
          value             = {this.state.content}
        />
        <div>
          <div>Characters remaining: {this.state.charsRemaining}</div>
        </div>
      </Dialog>
    )

  }

}

const ConfirmDialog = (props) => {

  const actions = [
    <FlatButton
      label           = 'Cancel'
      secondary       = {true}
      onTouchTap      = {props.onClose}
    />,
    <FlatButton
      label           = 'Ok'
      primary         = {true}
      onTouchTap      = {props.onConfirm}
    />,
  ]
    
  return (
    <Dialog
      title           = {'Confirm action'}
      actions         = {actions}
      modal           = {true}
      open            = {props.open}
      onRequestClose  = {props.onClose}>
      {props.message || 'Are you sure that you want to delete this message?'}
    </Dialog>
  )

}

const Message = (props) => {

  const { message } = props
  const styles = {
    container: {
      height: '100px', 
      borderBottom: '1px solid #eee',
      background: '#ffffff',
    },
    listItem: {
      overflow: 'visible',
    },
    iconMenu : {
      position: 'relative', 
      marginTop: '-4px', 
      marginLeft: '-20px',
    },
  }

  const toggleStarred = (e) => {
    e.stopPropagation() 
    props.onToggleStarred(message.id)
  }

  const toggleSelected = (e) => {
    e.stopPropagation() 
    props.onToggleSelected(message.id) 
  }

  return (
    <div style={styles.container}>
      <ListItem threeLine style={styles.listItem}>
        <ListItemContent 
          icon     = {(
            <Icon 
              name  = {('sms_in' === message.type) ? 'call_received' : 'call_made'}
              style = {{minHeight: '90px'}}
            />
          )}
          subtitle = {message.content}>
          {message.endpoint} 
          {!isNaN(message.timestamp) && (
            <span style={{color: '#999'}}>&nbsp;&mdash;&nbsp;
              {formatDate(message.timestamp)}
            </span> 
          )}
        </ListItemContent>
        <ListItemAction style={{marginRight: '13px'}}>
          <a href='#' onClick={toggleStarred}>
            <Icon name={props.starred ? 'star' : 'star_outline'} />
          </a>
        </ListItemAction>
        <ListItemAction style={{marginRight: '8px'}}>
          <Checkbox 
            checked  = {props.selected}
            onCheck  = {toggleSelected} 
          />
        </ListItemAction>
        <ListItemAction>
          <div style={styles.iconMenu}>
            <IconButton name='more_vert' id={`list-item-${message.id}`} />
            <Menu target={`list-item-${message.id}`} align='left'>
              <MenuItem onClick={(e) => { props.onDeleteMessage(message.id) }}>
                Delete
              </MenuItem>
              <MenuItem 
                onClick  = {(e) => { props.onReply(message.id) }} 
                disabled = {'sms_in' !== message.type}>
                Reply
              </MenuItem>
              <MenuItem 
                onClick  = {(e) => { props.onCallNumber(message.id) }} 
                disabled = {'sms_in' !== message.type}>
                Call number
              </MenuItem>
            </Menu>
          </div>
        </ListItemAction>
      </ListItem>
    </div>
  )

}

class ToolBar extends Component {
  render() {
    const styles = {
      container: {
        width: '100%', 
        borderBottom: '1px solid rgb(228, 228, 228)', 
        background: '#fafafa', 
        height: '60px', 
      },
      actions: {
        float: 'left', 
        paddingLeft: '24px', 
        paddingTop: '12px',
      },
      options: {
        float: 'right', 
        width: '200px', 
        paddingTop: '18px', 
      },
    }

    const { 
      onlyStarred,
      onSelectAll,
      onUnselectAll,
      onDeleteSelected,
      onUnstarAll,
      onToggleFilterStarred,
      hasSelected,
      hasStarred,
    } = this.props

    const toggleFilterStarred = (e) => {
      e.stopPropagation() 
      onToggleFilterStarred() 
    }

    return (
      <div style={styles.container}>
        <div style={styles.actions}>
          <FlatButton
            label           = 'Select all'
            primary         = {true}
            onTouchTap      = {onSelectAll}
          />&nbsp;
          <FlatButton
            label           = 'Unselect all'
            primary         = {true}
            disabled        = {!hasSelected}
            onTouchTap      = {onUnselectAll}
          />&nbsp;
          <FlatButton
            label           = 'Delete selected'
            icon            = {(
              <Icon name='clear_all' />
            )}
            secondary       = {true}
            disabled        = {!hasSelected}
            onTouchTap      = {onDeleteSelected}
          />&nbsp;
          <FlatButton
            label           = 'Unstar all'
            icon            = {(
              <Icon name='star_outline' />
            )}
            primary         = {true}
            disabled        = {!hasStarred}
            onTouchTap      = {onUnstarAll}
          />
        </div>
        <div style={styles.options}>
          <Checkbox 
            checked  = {onlyStarred}
            onCheck  = {toggleFilterStarred} 
            disabled = {!hasStarred && !onlyStarred}
            label    = 'Show only starred' 
          />
        </div>
      </div>
    )
  }
}

let smsCount = 1

class MessageList extends Component {

  props: {
    dispatch    : Function,
    sendMessage : Function,
    messages    : Object,
  }

  state: {
    starred           : Object,
    selected          : Object,
    filterStarred     : bool,
    showConfirmDialog : bool,
    showSMSDialog     : bool,
    showCallDialog    : bool,
    dialogMessage     : String,
    callNumber        : String,
    scrollTop         : number,
    messageId         : number,
    windowHeight      : number,
    replyToNumber     : number,
    replyToMessageId  : number,
  }

  constructor(props: Object) {
    super(props)
    this.state = {
      starred           : {},
      selected          : {},
      filterStarred     : false,
      showConfirmDialog : false,
      showSMSDialog     : false,
      showCallDialog    : false,
      dialogMessage     : '',
      callNumber        : '',
      scrollTop         : 0,
      messageId         : null,
      windowHeight      : window.innerHeight,
      replyToNumber     : null,
      replyToMessageId  : null,
    }
    this.handleWindowResize  = this.handleWindowResize.bind(this)
    this.toggleStarred       = this.toggleStarred.bind(this)
    this.toggleSelected      = this.toggleSelected.bind(this)
    this.confirmDelete       = this.confirmDelete.bind(this)
    this.confirmDeleteOne    = this.confirmDeleteOne.bind(this)
    this.selectAll           = this.selectAll.bind(this)
    this.unselectAll         = this.unselectAll.bind(this)
    this.unstarAll           = this.unstarAll.bind(this)
    this.toggleFilterStarred = this.toggleFilterStarred.bind(this)
    this.handleSendSMS       = this.handleSendSMS.bind(this)
    this.handleMakeCall      = this.handleMakeCall.bind(this)
    this.handleInfiniteLoad  = this.handleInfiniteLoad.bind(this)
  }

  handleInfiniteLoad(): void {
    const { dispatch, messages } = this.props
    if (messages.total > messages.limit) {
      dispatch({
        type : 'MESSAGES_INCREASE_LIMIT',
      })
    }
  }

  handleMakeCall(form: Object): void {
    const { sendMessage } = this.props
    sendMessage('callNumber', form)
    console.log(form)
    this.setState({
      showCallDialog: false,
    })
  }

  handleSendSMS(form: Object): void {
    const { sendMessage } = this.props
    const id = Date.now()+String(smsCount++%99999)
    let payload = { 
      type       : 'sms_out',
      endpoint   : form.phoneNumber,
      content    : form.content,
      channel_id : form.channel,
      reply_to   : this.state.replyToMessageId,
    }

    console.log({ [id]: payload })

    sendMessage('messageSend', { [id]: payload })
    this.setState({
      showSMSDialog: false,
    })
  }
  
  toggleStarred(id: number): void {
    let { starred, filterStarred } = this.state
    if (starred.hasOwnProperty(id)) {
      delete starred[id]
    } else {
      starred[id] = true
    }
    if (!Object.keys(starred).length && filterStarred) {
      filterStarred = false
    }
    this.setState({ starred, filterStarred })
  }

  toggleSelected(id: number): void {
    let { selected } = this.state
    if (selected.hasOwnProperty(id)) {
      delete selected[id]
    } else {
      selected[id] = true
    }
    this.setState({ selected })
  }

  selectAll(): void {
    const { messages } = this.props
    let selected = {}
    messages.ids.forEach((id) => {
      selected[id] = true
    })
    this.setState({ selected })
  }

  unselectAll(): void {
    this.setState({ selected: {} })
  }

  confirmDelete(): void {
    const count = Object.keys(this.state.selected).length
    let message = `Delete all ${count} selected messages?`
    if (1 == count) {
      message = 'Delete the selected message?'
    } else if (count < 4) {
      message = 'Delete selected messages?'
    }
    this.setState({
      showConfirmDialog : true,
      dialogMessage     : message,
      messageId         : null,
    })
  }

  confirmDeleteOne(id): void {
    this.setState({
      showConfirmDialog : true,
      dialogMessage     : '',
      messageId         : id,
    })
  }

  handleDeleteAction(): void {

    const { sendMessage, dispatch } = this.props

    let { 
      messageId, 
      selected, 
      starred,
    } = this.state

    if (messageId) {
      /* 
       *  Single message 
       */
      dispatch({
        type : 'MESSAGES_DELETE_ONE',
        id   : messageId,
      })
      delete starred[messageId]
      delete selected[messageId]
      sendMessage('messageDelete', { 
        [messageId]: null
      })
    } else {
      /* 
       *  Bulk delete
       */
      const ids = Object.keys(this.state.selected)
      dispatch({
        type : 'MESSAGES_DELETE_BULK',
        ids,
      })
      var keys = {}
      ids.forEach(id => {
        delete starred[id]
        keys[id] = null
      })
      selected = {}
      sendMessage('messageDelete', keys)
    }

    this.setState({
      showConfirmDialog : false,
      selected,
      starred,
    })

  }

  toggleFilterStarred(): void {
    const { filterStarred, scrollTop } = this.state
    const list = ReactDOM.findDOMNode(this.refs.list)
    this.setState({
      filterStarred: !filterStarred,
      scrollTop: (!list || filterStarred) ? scrollTop : list.scrollTop,
    })
  }
  
  unstarAll(): void {
    this.setState({ 
      starred: {},
      filterStarred: false,
    })
  }

  fetchAll(): void {
    const { dispatch } = this.props
    dispatch({
      type : 'MESSAGES_FETCH_ALL',
    })
    this.setState({
      scrollTop: -1,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const list = ReactDOM.findDOMNode(this.refs.list)
    if (list && !this.state.filterStarred && this.state.scrollTop > 0) {
      list.scrollTop = this.state.scrollTop
      this.setState({
        scrollTop: 0,
      })
    } else if (list && -1 === this.state.scrollTop) {
      this.setState({
        scrollTop: 0,
      })
      list.scrollTop = 100000  // @TODO
    }
  }

  handleWindowResize(e): void {
    this.setState({
      windowHeight : e.target.innerHeight,
    })
  }

  componentDidMount(): void {
    window.addEventListener('resize', this.handleWindowResize)
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.handleWindowResize)
  }

  render() {
    const { messages, mixer, tab } = this.props

    const { 
      dialogMessage,
      filterStarred, 
      selected, 
      showConfirmDialog, 
      showSMSDialog,
      showCallDialog,
      starred, 
    } = this.state

    const hasStarred = !!Object.keys(starred).length
    const hasSelected = !!Object.keys(selected).length

    const visible = filterStarred 
            ? messages.visible.filter(message => true === starred[message.id]) 
            : messages.visible

    const styles = {
      messageFAB: {
        position: 'fixed', 
        bottom: '30px', 
        right: '40px'
      },
      expandFAB: {
        position: 'absolute', 
        left: '50%', 
        top: '47px', 
        zIndex: 10
      },
      emptyList: {
        margin: '55px 150px', 
        padding: '50px 20px', 
        background: '#ffffff',
      },
    }

    const filteredChannels = mixer.channelList.filter(chan => 'free' == chan.mode)

    return (
      <div>

        {('messages' === tab) && (
          <span>
            <FloatingActionButton 
              style   = {styles.messageFAB}
              onClick = {() => {
                this.setState({
                  showSMSDialog    : true,
                  replyToNumber    : null,
                  replyToMessageId : null,
                })
              }}>
              <Icon name='message' />
            </FloatingActionButton>

            {messages.unread > 0 && (
              <FloatingActionButton 
                style           = {styles.expandFAB}
                mini            = {true}
                zDepth          = {1}
                backgroundColor = '#ffffff'
                iconStyle       = {{color: 'rgb(0, 188, 212)'}}
                onClick         = {() => this.fetchAll()}>
                <Icon name='expand_more' />
              </FloatingActionButton>
            )}
          </span>
        )}

        <CallDialog 
          channels     = {filteredChannels}
          open         = {showCallDialog}
          userChanFree = {mixer.userChanFree}
          phoneNumber  = {this.state.callNumber}
          onConfirm    = {this.handleMakeCall} 
          onClose      = {() => {
            this.setState({
              showCallDialog : false,
            })
          }}
        />
    
        <SendSMSDialog
          channels      = {filteredChannels}
          open          = {showSMSDialog} 
          replyToNumber = {this.state.replyToNumber}
          onConfirm     = {this.handleSendSMS} 
          onClose       = {() => {
            this.setState({
              showSMSDialog: false,
            })
          }}
        />

        <ConfirmDialog 
          message = {dialogMessage}
          open    = {showConfirmDialog} 
          onClose = {() => {
            this.setState({
              showConfirmDialog: false,
            })
          }}
          onConfirm = {() => this.handleDeleteAction()} 
        />

        <ToolBar 
          onlyStarred           = {filterStarred}
          hasSelected           = {hasSelected}
          hasStarred            = {hasStarred}
          onSelectAll           = {this.selectAll}
          onUnselectAll         = {this.unselectAll}
          onDeleteSelected      = {this.confirmDelete}
          onUnstarAll           = {this.unstarAll}
          onToggleFilterStarred = {this.toggleFilterStarred}
        />

        <div style={{marginTop: '-8px'}}>
          {visible.length ? (
            <List>
              <Infinite  
                styles                      = {{scrollableStyle: { padding: '0 140px' }}}
                ref                         = 'list' 
                useWindowAsScrollContainer  = {false}
                onInfiniteLoad              = {this.handleInfiniteLoad}
                infiniteLoadBeginEdgeOffset = {90}
                containerHeight             = {this.state.windowHeight - 150} 
                elementHeight               = {90}>
                {visible.map((message, i) => 
                  <Message 
                    key              = {i} 
                    message          = {message} 
                    starred          = {true === starred[message.id]}
                    selected         = {true === selected[message.id]}
                    onToggleStarred  = {this.toggleStarred}
                    onToggleSelected = {this.toggleSelected}
                    onDeleteMessage  = {this.confirmDeleteOne}
                    onReply          = {() => {
                      this.setState({
                        showSMSDialog : true,
                        replyToNumber    : message.endpoint,
                        replyToMessageId : message.id,
                      })
                    }}
                    onCallNumber     = {() => {
                      this.setState({
                        showCallDialog : true,
                        callNumber     : message.endpoint,
                      })
                    }}
                  />
                )}
              </Infinite>
            </List>
          ) : (
            <div style={styles.emptyList}>
              There are currently no messages to show.
            </div>
          )}
        </div>

      </div>
    )
  }

}

export default connect(state => _.pick(state, ['messages', 'mixer']))(MessageList)
