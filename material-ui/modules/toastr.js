import React  from 'react'
import styles from '../styles/toastr'

import { hideNotification, toastrRemoveMessage, toastrRefresh }
  from '../js/actions'
import { connect } 
  from 'react-redux'
import { TransitionMotion, Motion, spring, presets } 
  from 'react-motion'

import EnhancedButton
  from 'material-ui/internal/EnhancedButton'

class Toastr extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timer : null
    }
  }
  hideMessage(key) {
    window.setTimeout(() => this.props.dispatch(toastrRemoveMessage(key), 350))
  }
  componentDidMount() {
    const { dispatch } = this.props
    this.setState({
      timer : window.setInterval(() => dispatch(toastrRefresh()), 100)
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
                  style = {{...styles.toastr.box, transform: `scale(${config.style.zoom})`}}>
                  <EnhancedButton 
                    onTouchTap         = {() => this.hideMessage(config.key)}
                    touchRippleOpacity = {1}
                    touchRippleColor   = 'rgba(255, 255, 255, 0.35)'
                    style              = {styles.toastr.ripple}>
                    <i style={styles.toastr.icon} className='material-icons'>notifications</i>
                    <span style={styles.toastr.message}>
                      {config.data}
                    </span>
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

export default connect(state => ({
  toastr : state.toastr,
}))(Toastr)
