//import React             from 'react'
//import _                 from 'lodash'
//import Mixer             from './mixer'
//import CallLog           from './call-log'
//import Inbox             from './inbox'
//import Toastr            from './toastr'
//import SmsDialog         from './sms-dialog'
//import CallDialog        from './call-dialog'
//
//import { connect } 
//  from 'react-redux'
//import { reset, initialize } 
//  from 'redux-form/lib/actions'
//
//import AppBar   
//  from 'material-ui/lib/app-bar'
//import Tabs 
//  from 'material-ui/lib/tabs/tabs'
//import Tab 
//  from 'material-ui/lib/tabs/tab'
//import FloatingActionButton 
//  from 'material-ui/lib/floating-action-button'
//import Badge 
//  from 'material-ui/lib/badge'
//
//import IconCommunicationDialpad
//  from 'material-ui/lib/svg-icons/communication/dialpad'
//import IconCommunicationMessage
//  from 'material-ui/lib/svg-icons/communication/message'
//
//class App extends React.Component {
//  constructor(props) {
//    super(props)
//    this.state = {
//      tab        : 'mixer',
//      opacity    : 0,
//      //showDialog : false,
//      dialog  : null,
//      //message : null,
//    }
//  }
//  activateTab(tab) {
//    this.setState({tab})
//  }
//  renderAppBar() {
//    return 
//      <AppBar title='VoxBox' />
//  }
//  renderDialog() {
//    const { showDialog } = this.state
//    const { 
//      mixer: { 
//        channelList,
//      }, 
//      sendMessage, 
//    } = this.props
//    return (
//      <div>
// {/*
//        <CallDialog 
//          channels    = {channelList}
//          onClose     = {() => this.setState({dialog: null})} 
//          open        = {'call' == dialog} 
//          sendMessage = {sendMessage}
//        />
//        <SmsDialog
//          channels    = {channelList}
//          onClose     = {() => this.setState({dialog: null})} 
//          open        = {['send-message', 'forward-message', 'reply-to-message'].indexOf(dialog) > -1} 
//          sendMessage = {sendMessage}
//        />
//*/}
//      </div>
//    )
//  }
//  renderTabs() {
//    const { tab } = this.state
//    const { dispatch, sendMessage, inbox : { unreadCount } } = this.props
//    return (
//      <Tabs value={tab}>
//        <Tab
//          onActive = {() => this.activateTab('mixer')}
//          icon     = {<span><i className='material-icons'>volume_up</i></span>}
//          label    = 'Mixer' 
//          value    = 'mixer'>
//          <Mixer sendMessage={sendMessage} />
//        </Tab>
//        <Tab
//          onActive = {() => this.activateTab('inbox')}
//          icon     = {
//            <span>
//              <i className='material-icons'>message</i>
//              {!!unreadCount && (
//                <Badge
//                  style        = {styles.badge}
//                  badgeContent = {unreadCount}
//                  primary      = {true}>
//                </Badge>
//              )}
//            </span>
//          }
//          label    = 'Inbox' 
//          value    = 'inbox'>
//          <Inbox 
//            onReply     = {message => {
//	      //dispatch(reset('sendSMS'))
//              dispatch(initialize('sendSMS', ['recipient', message.endpoint]))
//              this.setState({dialog: 'reply-to-message', message})
//            }}
//            onForward   = {message => {
//	      //dispatch(reset('sendSMS'))
//              this.setState({dialog: 'forward-message', message})
//            }}
//            sendMessage = {sendMessage} 
//          />
//        </Tab>
//        {/*
//        <Tab
//          onActive = {() => this.activateTab('call_log')}
//          icon     = {<span><i className='material-icons'>history</i></span>}
//          label    = 'Call log' 
//          value    = 'call_log'>
//          <CallLog />
//        </Tab>
//        */}
//      </Tabs>
//    )
//  }
//  renderFAB() {
//    const { dispatch } = this.props
//    switch (this.state.tab) {
//      case 'mixer':
//        return (
//          <FloatingActionButton 
//            onClick = {() => {
//              this.setState({dialog: 'call'})
//	      dispatch(reset('callOut'))
//            }}
//            style   = {styles.fab}>
//            <IconCommunicationDialpad />
//          </FloatingActionButton>
//        )
//      case 'inbox':
//        return (
//          <FloatingActionButton 
//            onClick = {() => {
//	      this.setState({dialog: 'send-message'})
//	      dispatch(reset('sendSMS'))
//	    }}
//            style = {styles.fab}>
//            <IconCommunicationMessage />
//          </FloatingActionButton>
//        )
//      case 'call_log':
//      default:
//        return (
//          <span />
//        )
//    }
//  }
//  componentDidMount() {
//    window.setTimeout(() => this.setState({opacity: 1}), 100)
//  }
//  render() {
//    const { opacity } = this.state
//    return (
//      <div style={{opacity, ...styles.component}}>
//        {::this.renderDialog()}
//        {::this.renderAppBar()}
//        {::this.renderTabs()}
//        {::this.renderFAB()}
//      </div>
//    )
//  }
//}
//
//const styles = {
//  component: { 
//    WebkitTransition : 'opacity 1s',
//    transition       : 'opacity 1s',
//    width            : '100%',
//    marginBottom     : '100px',
//  },
//  fab: {
//    position         : 'fixed',
//    bottom           : '30px',
//    right            : '30px',
//  },
//  badge: {
//    position         : 'absolute',
//    marginTop        : '15px',
//  },
//}
//
//export default connect(state => _.pick(state, ['inbox', 'app', 'mixer']))(App)
