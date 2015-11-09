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
    const { channels, dispatch, ws } = this.props
    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 11}}> 
          <div>
            {_.pairs(channels).map(pair => {
              const [id, chan] = pair
              return (
                <Channel {...chan} 
                  key       = {id}
                  channelId = {id}
                  dispatch  = {dispatch}
                  ws        = {ws} />
              )
            })}
          </div>
        </div>
        <div style={{flex: 1, textAlign: 'center'}}> 
          <Master />
        </div>
      </div>
    )
  }
}

export default Mixer
