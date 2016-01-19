import React   from 'react'
import TimeAgo from 'react-timeago'
import moment  from 'moment'

import { removeMessage } 
  from '../js/actions'

class Inbox extends React.Component {
  constructor(props) {
    super(props)
  }
  deleteMessage(id) {
    const { dispatch, sendMessage } = this.props
    sendMessage('messageDelete', {
      [id]: null
    })
    dispatch(removeMessage(id))
  }
  getType(type) {
    switch (type) {
      case 'sms_in':
        return 'Incoming SMS'
      case 'sms_out':
        return 'Outgoing SMS'
      default:
        return type
    }
  }
  render() {
    const { notifications } = this.props
    return (
      <div>
        {!!notifications && !!notifications.length && (
          <div style={styles.inbox}>
            <table className='table' style={styles.table}>
              <colgroup>
                <col width='10%' />
                <col width='20%' />
                <col width='15%' />
                <col width='45%' />
                <col width='10%' />
              </colgroup>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Time</th>
                  <th>Sender</th>
                  <th>Content</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {notifications.map(item => (
                  <tr key={item.id}>
                    <td>{this.getType(item.type)}</td>
                    <td>
                      {isNaN(item.timestamp) ? '-' : (
                        <TimeAgo date={Number(item.timestamp)} />
                      )}
                    </td>
                    <td>{item.source}</td>
                    <td>{item.content}</td>
                    <td>
                      <button onClick={() => this.deleteMessage(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }
}

const styles = {
  inbox : {
    position   : 'fixed',
    zIndex     : 3,
    bottom     : 0,
    border     : '1px solid #888',
    width      : '70%',
    maxHeight  : '200px',
    overflowY  : 'scroll',
    background : '#ffffff'
  },
  table : {
    width      : '100%'
  },
}

export default Inbox
