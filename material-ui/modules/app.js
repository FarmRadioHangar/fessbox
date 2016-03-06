import React             from 'react'
import Mixer             from './mixer'
import CallLog           from './call-log'
import Inbox             from './inbox'
import Toastr            from './toastr'
import SendMessageDialog from './send-message-dialog'
import CallDialog        from './call-dialog'

import { connect } 
  from 'react-redux'

import AppBar   
  from 'material-ui/lib/app-bar'
import Tabs 
  from 'material-ui/lib/tabs/tabs'
import Tab 
  from 'material-ui/lib/tabs/tab'
import FloatingActionButton 
  from 'material-ui/lib/floating-action-button'
import Badge 
  from 'material-ui/lib/badge'

import IconCommunicationDialpad
  from 'material-ui/lib/svg-icons/communication/dialpad'
import IconCommunicationMessage
  from 'material-ui/lib/svg-icons/communication/message'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tab     : 'mixer',
      opacity : 0,
      dialog  : null,
      message : null,
    }
    this.renderFAB = this.renderFAB.bind(this)
    this.renderDialog = this.renderDialog.bind(this)
  }
  activateTab(tab) {
    this.setState({ tab })
  }
  renderAppBar() {
    return (
      <AppBar title='The Box' />
    )
  }
  renderDialog() {
    const { dialog, message } = this.state
    const { mixer : { channelList }, sendMessage } = this.props
    return (
      <div>
        <CallDialog 
          channels    = {channelList}
          onClose     = {() => this.setState({dialog: null})} 
          open        = {'call' == dialog} 
          sendMessage = {sendMessage}
        />
        <SendMessageDialog 
          channels    = {channelList}
          onClose     = {() => this.setState({dialog: null})} 
          open        = {['send-message', 'forward-message', 'reply-to-message'].indexOf(dialog) > -1} 
          dialog      = {dialog}
          message     = {message}
          sendMessage = {sendMessage}
        />
      </div>
    )
  }
  renderTabs() {
    const { tab } = this.state
    const { sendMessage, inbox : { unreadCount } } = this.props
    return (
      <Tabs value={tab}>
        <Tab
          onActive = {() => this.activateTab('mixer')}
          icon     = {<i className='material-icons'>volume_up</i>}
          label    = 'Mixer' 
          value    = 'mixer'>
          <Mixer />
        </Tab>
        <Tab
          onActive = {() => this.activateTab('inbox')}
          icon     = {
            <span>
              <i className='material-icons'>message</i>
              {!!unreadCount && (
                <Badge
                  style        = {styles.badge}
                  badgeContent = {unreadCount}
                  primary      = {true}>
                </Badge>
              )}
            </span>
          }
          label    = 'Inbox' 
          value    = 'inbox'>
          <Inbox 
            onReply     = {message => this.setState({dialog: 'reply-to-message', message})}
            onForward   = {message => this.setState({dialog: 'forward-message', message})}
            sendMessage = {sendMessage} 
          />
        </Tab>
        <Tab
          onActive = {() => this.activateTab('call_log')}
          icon     = {<i className='material-icons'>history</i>}
          label    = 'Call log' 
          value    = 'call_log'>
          <CallLog />
        </Tab>
      </Tabs>
    )
  }
  renderFAB() {
    switch (this.state.tab) {
      case 'mixer':
        return (
          <FloatingActionButton 
            onClick = {() => this.setState({dialog: 'call'})}
            style   = {styles.fab}>
            <IconCommunicationDialpad />
          </FloatingActionButton>
        )
      case 'inbox':
        return (
          <FloatingActionButton 
            onClick = {() => this.setState({dialog: 'send-message', message: null})}
            style   = {styles.fab}>
            <IconCommunicationMessage />
          </FloatingActionButton>
        )
      case 'call_log':
      default:
        return (
          <span />
        )
    }
  }
  componentDidMount() {
    window.setTimeout(() => this.setState({opacity: 1}), 100)
  }
  render() {
    const { opacity } = this.state
    return (
      <div style={{opacity, ...styles.component}}>
        {this.renderDialog()}
        {this.renderAppBar()}
        {this.renderTabs()}
        {this.renderFAB()}
      </div>
    )
  }
}

const styles = {
  component: { 
    WebkitTransition : 'opacity 1s',
    transition       : 'opacity 1s',
    width            : '100%',
    marginBottom     : '100px',
  },
  fab: {
    position         : 'fixed',
    bottom           : '30px',
    right            : '30px',
  },
  badge: {
    position         : 'absolute',
    marginTop        : '15px',
  },
}

const AppComponent = connect(state => ({
  inbox : state.inbox,
  app   : state.app,
  mixer : state.mixer,
}))(App)

export default AppComponent
