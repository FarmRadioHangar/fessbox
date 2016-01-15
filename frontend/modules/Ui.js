import React   from 'react'
import Sidebar from 'react-sidebar'
import Host    from './Host'
import Mixer   from './Mixer'

class Ui extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sidebarOpen    : false,
      sidebarDocked  : false,
      mediaQueryList : null
    }
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this)
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this)
    this.toggleMenu = this.toggleMenu.bind(this)
  }
  onSetSidebarOpen(open) {
    this.setState({sidebarOpen: open})
  }
  componentWillMount() {
    const mediaQueryList = window.matchMedia(`(min-width: 800px)`)
    mediaQueryList.addListener(this.mediaQueryChanged)
    this.setState({ mediaQueryList, sidebarDocked : mediaQueryList.matches })
  }
  componentWillUnmount() {
    this.state.mediaQueryList.removeListener(this.mediaQueryChanged)
  }
  mediaQueryChanged() {
    this.setState({ sidebarDocked : this.state.mediaQueryList.matches })
  }
  toggleMenu() {
    const docked = this.state.sidebarDocked
    this.setState({sidebarDocked: !docked})
  }
  render() {
    const { client, mixer, users } = this.props
    const { sidebarOpen, sidebarDocked } = this.state
    return !!users && users.hasOwnProperty(client.userId) && mixer.hasOwnProperty('channels') && mixer.channels.hasOwnProperty(client.userId) ? ( 
      <div>
        <div>
          <Sidebar sidebar = {(
            <div style = {styles.hostWrapper}>
              <button 
                style       = {styles.drawer.hamburger}
                className   = 'btn btn-default'
                type        = 'button'
                onClick     = {this.toggleMenu}>
                <span className='glyphicon glyphicon-menu-hamburger' />
              </button>
              <Host {...this.props} />
            </div>)}
              open          = {sidebarOpen}
              docked        = {sidebarDocked}
              onSetOpen     = {this.onSetSidebarOpen}>
            <div>
              {!sidebarDocked && (
                <button 
                  style     = {styles.hamburger}
                  className = 'btn btn-default'
                  type      = 'button'
                  onClick   = {this.toggleMenu}>
                  <span className='glyphicon glyphicon-menu-hamburger' />
                </button>
              )}
            </div>
            <div>
              <Mixer {...this.props} />
            </div>
          </Sidebar>
        </div>
      </div>
    ) : (
      <div>
        <Mixer {...this.props} />
      </div>
    )
  }
}

const styles = {
  hostWrapper : {
    minWidth   : '220px',
    height     : '100%',
    background : '#fff'
  },
  hamburger : {
    position   : 'absolute', 
    float      : 'left', 
    border     : 'none'
  },
  drawer : {
    hamburger : {
      width    : '100%', 
      border   : 'none'
    }
  }
}

export default Ui
