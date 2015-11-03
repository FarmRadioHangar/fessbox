import React   from 'react'
import _       from 'lodash'
import Channel from './Channel'

// temp
const channels = {
  'chan_1' : {},
  'chan_2' : {},
  'chan_3' : {},
  'chan_4' : {}
}

class Mixer extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
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
