import React     from 'react'
import Swipeable from 'react-swipeable'

class Drawer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open   : false,
      mobile : window.innerWidth < 992 
    }
    this.handleResize = this.handleResize.bind(this)
  }
  toggleDrawer() {
    this.setState({
      open : !this.state.open
    })
  }
  handleResize() {
    const innerWidth = window.innerWidth
    const old_val = this.state.mobile
    const new_val = innerWidth < 992
    if (old_val != new_val) {
      this.setState({mobile : new_val})
    }
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }
  handleSwipe() {
    this.toggleDrawer()
  }
  render() {
    const { open, mobile } = this.state
    const { width } = this.props
    const contentStyle = mobile ? {} : {marginLeft: width}
    return (
      <div>
        <Swipeable onSwipedLeft={this.handleSwipe.bind(this)}>
          <div style={{
            transition  : 'left .1s ease-out',
            position    : 'absolute',
            zIndex      : 1,
            left        : (open || !mobile) ? 0 : `-${width}`,
            width       : width,
            height      : '100%',
            background  : '#fff',
            ...this.props.style
          }}>
            {this.props.contents}
          </div>
        </Swipeable>
        <Swipeable onSwipedRight={this.handleSwipe.bind(this)}>
          <div style={contentStyle}>
            {this.props.children}
          </div>
        </Swipeable>
      </div>
    )
  }
}

Drawer.defaultProps = {
  width : '300px'
}

export default Drawer
