import React    from 'react'
import Channel  from './channel'
import Master   from './master'

import { connect } 
  from 'react-redux'

class Mixer extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { mixer : { channelList }, sendMessage } = this.props
    return (
      <div>
      {/*
        <Master sendMessage={sendMessage} />
        */}
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          {channelList.map(channel => (
            <Channel {...channel} 
              key         = {channel.id}
              sendMessage = {sendMessage}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  mixer : state.mixer,
}))(Mixer)

