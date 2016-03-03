import React   from 'react'
import Mixer   from './mixer'
import CallLog from './call-log'
import Inbox   from './inbox'
import Toastr  from './toastr'

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
import Dialog 
  from 'material-ui/lib/dialog'
import FlatButton 
  from 'material-ui/lib/flat-button'
import TextField 
  from 'material-ui/lib/text-field'
import AutoComplete 
  from 'material-ui/lib/auto-complete'

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
    }
    this.renderFAB = this.renderFAB.bind(this)
    this.handleCloseDialog = this.handleCloseDialog.bind(this)
  }
  activateTab(tab) {
    this.setState({ tab })
  }
  renderAppBar() {
    return (
      <AppBar title='The Box' />
    )
  }
  handleCloseDialog() {
    this.setState({
      dialog : null
    })
  }
  renderDialog() {
    const { dialog } = this.state
    const actions = [
      <FlatButton
        label           = 'Cancel'
        secondary       = {true}
        onTouchTap      = {this.handleCloseDialog}
      />,
      <FlatButton
        label           = 'Send'
        primary         = {true}
        keyboardFocused = {true}
        onTouchTap      = {this.handleCloseDialog}
      />,
    ]
    return (
      <Dialog
        title          = 'Send message'
        actions        = {actions}
        modal          = {false}
        open           = {!!dialog}
        onRequestClose = {this.handleCloseDialog}>
        <AutoComplete
          hintText          = 'Type a contact name or phone number'
          dataSource        = {['Bob', 'Alice', 'Knuth', 'Greg', 'Alex', 'Adrian']}
          onUpdateInput     = {() => {}}
          floatingLabelText = 'Recepient'
          fullWidth         = {true}
        />
        {'send-message' == dialog && (
          <TextField
            hintText   = 'Message content'
            fullWidth  = {true}
            multiLine  = {true}
            rows       = {3} 
          />
        )}
      </Dialog>
    )
  }
  renderTabs() {
    const { tab } = this.state
    const { sendMessage } = this.props
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
          icon     = {<i className='material-icons'>message</i>}
          label    = 'Inbox' 
          value    = 'inbox'>
          <Inbox sendMessage={sendMessage} />
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
            onClick = {() => {}}
            style   = {styles.fab}>
            <IconCommunicationDialpad />
          </FloatingActionButton>
        )
      case 'inbox':
        return (
          <FloatingActionButton 
            onClick = {() => this.setState({dialog: 'send-message'})}
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
}


const AppComponent = connect(state => ({
  inbox : state.inbox,
  app   : state.app,
}))(App)

export default AppComponent
