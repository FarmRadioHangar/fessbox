// @flow
import React, { Component } from 'react'
import ReactDOM, { render } from 'react-dom'
import { connect } from 'react-redux'

import Tabs 
  from 'material-ui/Tabs/Tabs'
import Tab
  from 'material-ui/Tabs/Tab'

import { Badge, Icon } from 'react-mdl'

import MessageList from './messagelist.jsx'
import Mixer from './mixer.jsx'
import Toastr from './toastr.jsx'
import RingingIcon from './ringingicon.jsx'

class Dashboard extends Component {

  props: {}

  state: {
    tab: string
  }

  constructor(props: string) {
    super(props)
    this.state = {
      tab : 'mixer',
    }
  }

  render() {
    const { tab } = this.state
    const { messages, sendMessage, mixer } = this.props

    const mixerIcon = mixer.ringing ? (
      <RingingIcon />
    ) : (
      <Icon name='volume_up' />
    )
    const messagesIcon = messages.unread > 0 ? (
      <Badge text={messages.unread} overlap>
        <Icon name='message' />
      </Badge>
    ) : (
      <Icon name='message' />
    )

    return (
      <div>
        <Toastr />
        <Tabs value={tab} onChange={(tab) => this.setState({ tab })}>
          <Tab style={{height: '78px'}} 
            icon  = {mixerIcon}
            value = 'mixer'
            label = 'Mixer'>
            <div>
              <Mixer 
                tab         = {tab}
                sendMessage = {sendMessage} 
              />
            </div>
          </Tab>
          <Tab style={{height: '78px'}} 
            icon  = {messagesIcon}
            value = 'messages'
            label = 'Messages'>
            <MessageList 
              tab         = {tab}
              sendMessage = {sendMessage} 
            />
          </Tab>
        </Tabs>
      </div>
    )
  }

}

export default connect(state => _.pick(state, ['messages', 'mixer']))(Dashboard)
