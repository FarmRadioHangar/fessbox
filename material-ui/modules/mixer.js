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
        <Master />
        {channelList.map(channel => (
          <Channel {...channel} 
            key         = {channel.id}
            sendMessage = {sendMessage}
          />
        ))}
      </div>
    )
  }
}

export default connect(state => ({
  mixer : state.mixer,
}))(Mixer)

