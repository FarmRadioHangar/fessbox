import React   from 'react'
import TimeAgo from 'react-timeago'

import { connect } 
  from 'react-redux'

import List 
  from 'material-ui/lib/lists/list'
import ListItem 
  from 'material-ui/lib/lists/list-item'
import Divider 
  from 'material-ui/lib/divider'
import Subheader 
  from 'material-ui/lib/Subheader'

import { grey400, darkBlack, lightBlack } 
  from 'material-ui/lib/styles/colors'

function messageType(key, read) {
  if ('sms_in' == key) {
    return `${read ? 'Incoming' : 'New incoming'} SMS from`
  } else {
    return 'Outgoing SMS to'
  }
}

class Inbox extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { inbox : { visibleMessages } } = this.props
    return (
      <List>
        <Subheader>Messages</Subheader>
        {visibleMessages.map(message => (
          <div>
            <Divider />
            <ListItem
              key                = {message.id}
              primaryText        = {`${messageType(message.type, message.read)} ${message.source}`}
              secondaryTextLines = {2}
              secondaryText      = {
                <p>
                  {!isNaN(message.timestamp) && (
                    <span style={{color: darkBlack}}>
                      <TimeAgo date={Number(message.timestamp)} /> &mdash;&nbsp;
                    </span> 
                  )}
                  {message.content}
                </p>
              }
            />
          </div>
        ))}
      </List>
    )
  }
}

const InboxComponent = connect(state => ({
  inbox : state.inbox,
}))(Inbox)

export default InboxComponent
