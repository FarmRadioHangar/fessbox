import React, { Component } from 'react'
import ReactDOM      from 'react-dom'
import Mixer         from './mixer'
import MessageBox    from './message-box'
import SmsDialog     from './sms-dialog'
import CallDialog    from './call-dialog'
import ConfirmDialog from './confirm-dialog'
import Toastr        from './toastr'
import styles        from '../styles/dashboard'

import { connect } 
  from 'react-redux'
import { setDialog, removeMessage, toastrAddMessage }
  from '../js/actions'
import { actions } 
  from 'react-redux-form'

import Tabs  from 'material-ui/Tabs/Tabs'
import Tab   from 'material-ui/Tabs/Tab'
import Badge from 'material-ui/Badge'
import FloatingActionButton 
  from 'material-ui/FloatingActionButton'
import IconCommunicationDialpad
  from 'material-ui/svg-icons/communication/dialpad'
import IconCommunicationMessage
  from 'material-ui/svg-icons/communication/message'

let msgListScrollPos = 0

class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tab       : 'mixer',
      opacity   : 0,
      scrollPos : 0,
    }
  }
  handleDeleteMessage(id, lokiId) {
    const { dispatch, sendMessage } = this.props
    dispatch(setDialog(null))
    sendMessage('messageDelete', { 
      [id]: null
    })
    dispatch(removeMessage(lokiId))
    dispatch(toastrAddMessage('The message was deleted.'))
  }
  scrollNode() {
    return ReactDOM.findDOMNode(this.refs.messageList).parentNode.parentNode
  }
  componentDidMount() {
    this.scrollNode().addEventListener('scroll', ::this.handleScrollEvent)
    window.setTimeout(() => this.setState({opacity: 1}), 130)
  }
  componentWillUnmount() {
    this.scrollNode().removeEventListener('scroll', ::this.handleScrollEvent)
  }
  handleScrollEvent(e) {
    const { tab } = this.state
    if ('messages' === tab) {
      msgListScrollPos = e.target.scrollTop
    }
  }
  activateTab(tab) {
    const { dispatch } = this.props
    const scrollPos = 'messages' === tab ? msgListScrollPos : 0
    this.setState({tab, scrollPos})
  }
  renderDialog() {
    const { 
      app   : { dialog }, 
      mixer : { channelList }, 
      sendMessage, 
      dispatch,
    } = this.props
    return (
      <div>
        <CallDialog 
          channels    = {channelList}
          onClose     = {() => dispatch(setDialog(null))} 
          open        = {'call' == dialog} 
          sendMessage = {sendMessage}
        />
        <SmsDialog
          channels    = {channelList}
          onClose     = {() => dispatch(setDialog(null))} 
          open        = {'sms' == dialog} 
          sendMessage = {sendMessage}
        />
        <ConfirmDialog
          onClose     = {() => dispatch(setDialog(null))} 
          onConfirm   = {::this.handleDeleteMessage}
          open        = {'confirm' == dialog} 
          sendMessage = {sendMessage}
        />
      </div>
    )
  }
  renderFAB() {
    const { dispatch } = this.props
    switch (this.state.tab) {
      case 'mixer':
        return (
          <FloatingActionButton 
            style   = {styles.fab}
            onClick = {() => {
              dispatch(actions.reset('call'))
              dispatch(setDialog('call')) 
            }}>
            <IconCommunicationDialpad />
          </FloatingActionButton>
        )
      case 'messages':
        return (
          <FloatingActionButton 
            style   = {styles.fab}
            onClick = {() => {
              dispatch(actions.reset('sms'))
              dispatch(setDialog('sms')) 
            }}>
            <IconCommunicationMessage />
          </FloatingActionButton>
        )
      case 'call_log':
      case 'config':
      default:
        return <span />
    }
  }
  renderTabs() {
    const { tab } = this.state
    const { sendMessage, messages : { unread } } = this.props
    const mixerIcon = (
      <span>
        <i className='material-icons'>volume_up</i>
      </span>
    )
    const inboxIcon = (
      <span>
        <i className='material-icons'>message</i>
        {!!unread && (
          <Badge
            style        = {styles.badge}
            badgeContent = {unread}
            primary      = {true}>
          </Badge>
        )}
      </span>
    )
    return (
      <div style={{height: '100%'}}>
        <Tabs 
          contentContainerStyle = {{
            position  : 'fixed',
            top       : '72px',
            width     : '100%',
            height    : 'calc(100% - 72px)',
            overflowX : 'hidden',
            overflowY : 'scroll',
          }}
          value = {tab}>
          <Tab 
            onActive = {() => this.activateTab('mixer')}
            icon     = {mixerIcon}
            label    = 'Mixer'
            value    = 'mixer'>
            <Mixer style={{height: '100%'}} sendMessage={sendMessage} />
          </Tab>
          <Tab
            onActive = {() => this.activateTab('messages')}
            icon     = {inboxIcon}
            label    = 'Messages'
            value    = 'messages'>
            <MessageBox 
              scrollPos   = {this.state.scrollPos}
              active      = {'messages' === this.state.tab}
              ref         = 'messageList'
              style       = {{height: '100%'}}
              sendMessage = {sendMessage} />
          </Tab>
        </Tabs>
      </div>
    )
  }
  render() {
    const { sendMessage } = this.props
    const { opacity } = this.state
    return (
      <div style={{opacity, ...styles.component}}>
        <Toastr />
        {this.renderDialog()}
        {this.renderTabs()}
        {this.renderFAB()}
      </div>
    )
  }
}

export default connect(state => _.pick(state, ['messages', 'app', 'mixer']))(Dashboard)
