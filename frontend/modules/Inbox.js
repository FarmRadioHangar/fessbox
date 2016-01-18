import React   from 'react'
import moment  from 'moment'

import { removeInboxMessage }
  from '../js/actions'

/*
class Notifications extends React.Component {
  constructor(props) {
    super(props)
  }
  formatDate(date) {
    return moment(date).fromNow()
  }
  render() {
    const { items } = this.props
    if (!items || !items.length) {
      return <span />
    }
    return (
      <tbody>
        {items.map((item, i) => (
          <tr key={i}>
            <td>{item.type}</td>
            <td>{this.formatDate(item.timestamp)}</td>
            <td>{item.source}</td>
            <td>{item.content}</td>
            <td><a href='#'>Delete message</a></td>
          </tr>
        ))}
      </tbody>
    )
  }
}
*/

class Inbox extends React.Component {
  constructor(props) {
    super(props)
  }
  formatDate(date) {
    return moment(date).fromNow()
  }
  deleteMessage(id) {
    const { dispatch } = this.props
    dispatch(removeInboxMessage(id))
  }
  render() {
    const { notifications } = this.props
    return (
      <div>
        {!!notifications && !!Object.keys(notifications).length && (
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
                {Object.keys(notifications).map(msgId => {
                  const item = notifications[msgId]
                  return (
                    <tr key={msgId}>
                      <td>{item.type}</td>
                      <td>{this.formatDate(item.timestamp)}</td>
                      <td>{item.source}</td>
                      <td>{item.content}</td>
                      <td>
                        <button onClick={() => this.deleteMessage(msgId)}>Delete message</button>
                      </td>
                    </tr>
                  )
                })}
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
