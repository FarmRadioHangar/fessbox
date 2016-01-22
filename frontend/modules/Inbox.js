import React   from 'react'
import TimeAgo from 'react-timeago'
import moment  from 'moment'

import { removeMessage } 
  from '../js/actions'

class Inbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded : false
    }
    this.toggleExpand = this.toggleExpand.bind(this)
  }
  toggleExpand() {
    this.setState({
      expanded : !this.state.expanded
    })
  }
  deleteMessage(id) {
    const { dispatch, sendMessage } = this.props
    sendMessage('messageDelete', {
      [id]: null
    })
    dispatch(removeMessage(id))
  }
  getType(type) {
    const { t } = this.props
    switch (type) {
      case 'sms_in':
        return t('Incoming SMS')
      case 'sms_out':
        return t('Outgoing SMS')
      default:
        return type
    }
  }
  render() {
    const { notifications, t } = this.props
    return (
      <div>
        {!!notifications && !!notifications.length && (
          <div style={{
            maxHeight : this.state.expanded ? '300px' : '45px',
            ...styles.inbox
          }}>
            <div onClick={this.toggleExpand} style={styles.toggleButton}>
              <i className = {`glyphicon glyphicon-arrow-${this.state.expanded ? 'down' : 'up'}`} />
            </div>
            {this.state.expanded ? (
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
                    <th>{t('Type')}</th>
                    <th>{t('Time')}</th>
                    <th>{t('Sender')}</th>
                    <th>{t('Content')}</th>
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
            ) : (
              <div style={{margin: '10px'}}>
                {!!notifications.length && (
                  <span>
                    {t('Inbox')} <span className='badge'>{notifications.length}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

const styles = {
  inbox: {
    position     : 'fixed',
    zIndex       : 3,
    bottom       : 0,
    border       : '1px solid #888',
    width        : '70%',
    overflowY    : 'scroll',
    background   : '#ffffff',
  },
  table: {
    width        : '100%',
  },
  toggleButton: {
    cursor       : 'pointer',
    position     : 'absolute',
    background   : '#ffffff',
    right        : 0,
    top          : 0,
    padding      : '6px',
    borderBottom : '1px solid #888888',
    borderLeft   : '1px solid #888888',
  },
}

export default Inbox
