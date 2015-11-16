import React  from 'react'
import Slider from './Slider'

class SliderBar extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { icon } = this.props
    return (
      <div>
        <div style={{textAlign: 'center'}}> 
          <Slider orientation='vertical' reversed={true} min={0} max={100} />
        </div>
        <div style={{textAlign: 'center', padding: '.7em'}}> 
          <i className='material-icons' style={{fontSize: '36px'}}>{icon}</i>
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
        <div style={{flex: 1}}> 
          <SliderBar icon='mic' />
        </div>
        <div style={{flex: 1}}> 
          <SliderBar icon='hs' />
        </div>
      </div>
    )
  }
}

export default Host
