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
    return (users && users[client.userId] && mixer.channels) ? (
      <Sidebar sidebar = {(
        <div style = {styles.hostWrapper}>
          <Host {...this.props} />
        </div>
      )}
        open       = {this.state.sidebarOpen}
        docked     = {this.state.sidebarDocked}
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
    height     : '100%',
    background : '#fff'
  }
}

export default Ui
