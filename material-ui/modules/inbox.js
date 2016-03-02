import React   from 'react'
import TimeAgo from 'react-timeago'

import { connect } 
  from 'react-redux'

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
import RadioButton 
  from 'material-ui/lib/radio-button'

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
        <Subheader>SMS Messages</Subheader>
        {visibleMessages.map(message => (
          <div key={message.id}>
            <Divider />
            <ListItem
              leftAvatar         = {
                <i className='material-icons'>notifications</i>
              }
              primaryText        = {`${messageType(message.type, message.read)} ${message.source}`}
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
                <div>
                  <IconButton style={styles.icon}>
                    <i className='material-icons'>reply</i>
                  </IconButton>
                  <IconButton style={styles.icon}>
                    <i className='material-icons'>forward</i>
                  </IconButton>
                  <IconButton style={styles.icon}>
                    <i className='material-icons'>favorite_border</i>
                  </IconButton>
                  <IconButton style={styles.icon}>
                    <i className='material-icons'>delete_forever</i>
                  </IconButton>
                </div>
              }
            />
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
    paddingRight : '256px',
  },
}

const InboxComponent = connect(state => ({
  inbox : state.inbox,
}))(Inbox)

export default InboxComponent
