import React    from 'react'
import Channel  from './channel'
import Master   from './master'
import _        from 'lodash'

import { connect } 
  from 'react-redux'

class Mixer extends React.Component {
  render() {
    const { app : { diff }, dispatch, mixer : { channelList }, sendMessage } = this.props
    return (
      <div>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <Master sendMessage={sendMessage} />
          {channelList.map(channel => (
            <Channel {...channel} 
              diff        = {diff}
              dispatch    = {dispatch}
              key         = {channel.id}
              sendMessage = {sendMessage}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default connect(state => _.pick(state, ['mixer', 'app']))(Mixer)
