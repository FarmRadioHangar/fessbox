import React  from 'react'
import Slider from './Slider'

class SliderBar extends React.Component {
  constructor(props) {
    super(props)
  }
  toggleMuted() {
    /* @todo */
  }
  render() {
    const { icon, muted } = this.props
    return (
      <div>
        <div style={{textAlign: 'center'}}> 
          <Slider orientation='vertical' reversed={true} min={0} max={100} />
        </div>
        <div style={{textAlign: 'center', margin: '12px 0'}}> 
          <a href='#' onClick={this.toggleMuted.bind(this)}>
            <i className={muted ? 'fa fa-volume-off' : 'fa fa-volume-up'} />
          </a>
        </div>
        <div style={{textAlign: 'center', padding: '.7em'}}> 
          <i className={`fa fa-${icon}`} />
        </div>
      </div>
    )
  }
}

class Host extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1, minWidth: '80px'}}> 
          <SliderBar icon='microphone' />
        </div>
        <div style={{flex: 1, minWidth: '80px'}}> 
          <SliderBar icon='headphones' />
        </div>
      </div>
    )
  }
}

export default Host
