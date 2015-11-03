import React  from 'react'
import Host   from './Host'
import Mixer  from './Mixer'
import Stream from './Stream'

class Ui extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <Host />
        <Mixer />
        <Stream />
      </div>
    )
  }
}

export default Ui
