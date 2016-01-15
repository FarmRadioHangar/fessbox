import React   from 'react'

class Notifications extends React.Component {
  constructor(props) {
    super(props)
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
            <td>{(new Date(item.timestamp)).toString()}</td>
            <td>{item.source}</td>
            <td>{item.content}</td>
          </tr>
        ))}
      </tbody>
    )
  }
}

class Inbox extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { notifications } = this.props
    const notificationTypes = ['sms']
    return (
      <div>
        {notifications && Object.keys(notifications).length && (
          <div style={styles.inbox}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Time</th>
                  <th>Sender</th>
                  <th>Content</th>
                </tr>
              </thead>
              {notificationTypes.map((type, i) => (
                <Notifications key={i} items={notifications[type]} />
              ))}
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
