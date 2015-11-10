import React from 'react'

class Master extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <div style={{textAlign: 'center'}}> 
          12:12
        </div>
        <div style={{textAlign: 'center'}}> 
          <input type='range' orient='vertical' style={{width: '10px', height: '400px', WebkitAppearance: 'slider-vertical'}} />
        </div>
        <div style={{textAlign: 'center'}}> 
          Icon
        </div>
      </div>
    )
  }
}

export default Master
