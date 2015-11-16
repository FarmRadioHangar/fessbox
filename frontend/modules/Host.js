import React  from 'react'
import Slider from './Slider'

class Placeholder extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { icon } = this.props
    return (
      <div>
        <div style={{textAlign: 'center'}}> 
          <Slider orientation='vertical' min={0} max={100} />
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
          <Placeholder icon='mic' />
        </div>
        <div style={{flex: 1}}> 
          <Placeholder icon='hs' />
        </div>
      </div>
    )
  }
}

export default Host
