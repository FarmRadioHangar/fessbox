import React from 'react'

import { refreshToastr, hideNotification }
  from '../js/actions'
import { connect } 
  from 'react-redux'
import { TransitionMotion, Motion, spring, presets } 
  from 'react-motion'

import EnhancedButton
  from 'material-ui/lib/enhanced-button'

class Toastr extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timer : null
    }
  }
  hideMessage(key) {
    window.setTimeout(() => this.props.dispatch(hideNotification(key)), 350)
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
      <div style={styles.component}>
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
              {interpolated.map(config => 
                <div 
                  key   = {config.key}
                  style = {{...styles.box, transform: `scale(${config.style.zoom})`}}>
                  <EnhancedButton 
                    onTouchTap         = {() => this.hideMessage(config.key)}
                    touchRippleOpacity = {1}
                    touchRippleColor   = 'rgba(255, 255, 255, 0.35)'
                    style              = {styles.ripple}>
                    {config.data}
                  </EnhancedButton>
                </div>
              )}
            </div>
          }
        </TransitionMotion>
      </div>
    )
  }
}

const styles = {
  component: {
    position        : 'absolute', 
    right           : '30px', 
    top             : '30px', 
    zIndex          : 2000,
  },
  box: {
    width           : '300px',
    backgroundColor : 'rgba(27, 155, 92, 0.6)',
    lineHeight      : '19px',
  },
  ripple: {
    textAlign       : 'left',
    padding         : '10px 10px 12px',
    color           : 'white',
  },
}

const ToastrComponent = connect(state => ({
  toastr : state.toastr,
}))(Toastr)

export default ToastrComponent
