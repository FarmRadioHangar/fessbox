import React    from 'react'
import _        from 'lodash'
import Channel  from './Channel'
import Master   from './Master'

import { ListGroup } 
  from 'react-bootstrap'

class Mixer extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { mixer : { channels, master }, client, dispatch, sendMessage } = this.props
    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 11}}> 
          <div ref='channels'>
            {_.pairs(channels).map(pair => {
              const [id, chan] = pair
              return (id != client.hostId) ? (
                <Channel {...chan} 
                  key         = {id}
                  channelId   = {id}
                  client      = {client}
                  dispatch    = {dispatch}
                  sendMessage = {sendMessage} />
              ) : (
                <span key={id} />
              )
            })}
          </div>
        </div>
        <div style={{flex: 1, textAlign: 'center'}}> 
          {!!master && Object.keys(master).length && (
            <Master {...master} 
              dispatch    = {dispatch} 
              sendMessage = {sendMessage} />
          )}
        </div>
      </div>
    )
  }
}

export default Mixer
