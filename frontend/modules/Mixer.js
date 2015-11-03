import React   from 'react'
import _       from 'lodash'
import Channel from './Channel'

class Mixer extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { channels } = this.props
    return (
      <div>
        {_.pairs(channels).map(pair => {
          const [key, chan] = pair
          return (
            <Channel {...chan}
              key   = {key}
              index = {key} />
          )
        })}
      </div>
    )
  }
}

export default Mixer
