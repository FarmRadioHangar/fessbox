import React from 'react'

class Master extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <div style={{border: '1px solid #ddd', textAlign: 'center'}}> 
          12:12
        </div>
        <div style={{border: '1px solid #ddd', textAlign: 'center'}}> 
          <input type='range' orient='vertical' style={{width: '10px', height: '400px', WebkitAppearance: 'slider-vertical'}} />
        </div>
        <div style={{border: '1px solid #ddd', textAlign: 'center'}}> 
          Icon
        </div>
      </div>
    )
  }
}

export default Master
