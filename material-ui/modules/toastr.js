import React from 'react'

import { refreshToastr }
  from '../js/actions'
import { connect } 
  from 'react-redux'
import { TransitionMotion, Motion, spring, presets } 
  from 'react-motion'

class Toastr extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timer : null
    }
  }
  componentDidMount() {
    const { dispatch } = this.props
    this.setState({
      timer : window.setInterval(() => dispatch(refreshToastr()), 100)
    })
  }
  componentWillUnmount() {
    const { timer } = this.state
    if (timer) {
      window.clearInterval(timer)
    }
  }
  render() {
    const { toastr : { messages } } = this.props
    return (
      <TransitionMotion
        willEnter = {() => ({ zoom : 0 })}
        willLeave = {() => ({ zoom : spring(0, presets.stiff) })}
        styles = {messages.map(item => ({
          key   : item.key,
          data  : item.content,
          style : { 
            zoom : spring(1, { stiffness: 200, damping: 10 }), 
          },
        }))}>
        {interpolated =>
          <div>
            {interpolated.map((config, i) => 
              <div key={config.key} style={{
                ...styles.component,
                transform : `scale(${config.style.zoom})`,
              }}>
                {config.data}
              </div>
            )}
          </div>
        }
      </TransitionMotion>
    )
  }
}

const styles = {
  component: {
    width     : '100px',
    height    : '100px',
    border    : '1px solid',
  }
}

const ToastrComponent = connect(state => ({
  toastr : state.toastr,
}))(Toastr)

export default ToastrComponent
