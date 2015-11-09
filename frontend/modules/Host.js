import React from 'react'

class Slider extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { icon } = this.props
    return (
      <div>
        <div style={{border: '1px solid #ddd', textAlign: 'center'}}> 
          <input type='range' orient='vertical' style={{width: '10px', height: '400px', WebkitAppearance: 'slider-vertical'}} />
        </div>
        <div style={{border: '1px solid #ddd', textAlign: 'center', padding: '.7em'}}> 
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
        <div style={{flex: 1, border: '1px solid #ddd'}}> 
          <Slider icon='mic' />
        </div>
        <div style={{flex: 1, border: '1px solid #ddd'}}> 
          <Slider icon='headset' />
        </div>
      </div>
    )
  }
}

export default Host
