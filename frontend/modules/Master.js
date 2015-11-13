import React from 'react'

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
    const value = event.target.value
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
          <input type='range' min={0} max={100} onChange={this.updateLevel.bind(this)} orient='vertical' style={{width: '10px', height: '400px', WebkitAppearance: 'slider-vertical'}} defaultValue={level} />
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
