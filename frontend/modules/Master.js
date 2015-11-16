import React  from 'react'
import Slider from './Slider'

import { updateMasterLevel }
  from '../js/actions'

class Master extends React.Component {
  constructor(props) {
    super(props)
  }
  toggleMuted() {
    const { dispatch, muted, sendMessage } = this.props
    sendMessage('masterMuted', !muted)
  }
  updateLevel(event) {
    const { dispatch, sendMessage } = this.props
    const value = event.target ? event.target.value : event
    sendMessage('masterVolume', value)
    dispatch(updateMasterLevel(value))
  }
  render() {
    const { level, muted } = this.props
    return (
      <div>
        <div style={{textAlign: 'center'}}> 
          12:12
        </div>
        <div style={{textAlign: 'center'}}> 
          {/*
          <input type='range' min={0} max={100} onChange={this.updateLevel.bind(this)} orient='vertical' style={{width: '10px', height: '400px', WebkitAppearance: 'slider-vertical'}} defaultValue={level} />
          */}
          <Slider orientation='vertical' reversed={true} min={0} max={100} defaultValue={level} onChange={(from, to) => {this.updateLevel(to)}} />
        </div>
        <div style={{textAlign: 'center'}}> 
          <input type='checkbox' onChange={this.toggleMuted.bind(this)} checked={!!muted} />
          Muted
        </div>
        <div style={{textAlign: 'center'}}> 
          Icon
        </div>
      </div>
    )
  }
}

export default Master
