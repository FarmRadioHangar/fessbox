import React  from 'react'
import Slider from './Slider'

import { updateHostLevel }
  from '../js/actions'

class Host extends React.Component {
  constructor(props) {
    super(props)
  }
  toggleMuted() {
    const { muted, sendMessage } = this.props
    sendMessage('hostMuted', !muted)
  }
  updateLevel(event) {
    const { dispatch, sendMessage } = this.props
    const value = event.target ? event.target.value : event
    sendMessage('hostVolume', value)
    dispatch(updateHostLevel(value))
  }
  render() {
    const { level, muted, active } = this.props
    return (
      <div className='panel panel-default' style={{
        ...styles.panel,
        backgroundColor : active ? '#f04124' : 'transparent'
      }}>
        <div className='panel-body'>
          <div>
            <div style={styles.sliderWrapper}> 
              <Slider 
                orientation  = 'vertical'
                reversed     = {true}
                min          = {1}
                max          = {100}
                defaultValue = {level}
                value        = {level}
                enabled      = {!muted}
                onChange     = {(from, to) => { this.updateLevel(to) }} />
            </div>
          </div>
          <div style={styles.buttonWrapper}> 
            <button 
              style          = {styles.button} 
              className      = 'btn btn-default btn-sm' 
              onClick        = { () => this.toggleMuted() }>
              <i className={`glyphicon glyphicon-volume-${muted ? 'off' : 'up'}`} />
            </button>
          </div>
          <div style={styles.label}>H</div>
        </div>
      </div>
    )
  }
}

const styles = {
  buttonWrapper : {
    textAlign    : 'center', 
    margin       : '12px 0'
  },
  button : {
    lineHeight   : 1.9, 
    borderRadius : '50% 50%'
  },
  label : {
    textAlign    : 'center'
  },
  panel : {
    margin: '11px 11px 11px 0'
  },
  sliderWrapper : {
    textAlign: 'center'
  },
}

export default Host
