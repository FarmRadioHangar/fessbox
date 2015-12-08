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
  render() {
    const { client, mixer, users } = this.props
    const { sidebarOpen, sidebarDocked } = this.state
    return !!users && users.hasOwnProperty(client.userId) && mixer.hasOwnProperty('channels') && mixer.channels.hasOwnProperty(client.userId) ? ( 
      <Sidebar sidebar = {(
        <div style = {styles.hostWrapper}>
          <Host {...this.props} />
        </div>
      )}
        open       = {sidebarOpen}
        docked     = {sidebarDocked}
        onSetOpen  = {this.onSetSidebarOpen}>
        <Mixer {...this.props} />
      </Sidebar>
    ) : (
      <Mixer {...this.props} />
    )
  }
}

const styles = {
  hostWrapper : {
    minWidth   : '220px',
    height     : '100%',
    background : '#fff'
  }
}

export default Ui
