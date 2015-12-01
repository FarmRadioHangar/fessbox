import React   from 'react'
import Sidebar from 'react-sidebar'
import Host    from './Host'
import Mixer   from './Mixer'
import Stream  from './Stream'

class Ui extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sidebarOpen    : false,
      sidebarDocked  : false,
      mediaQueryList : null
    }
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this)
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
    return (
      <Sidebar sidebar = {(
        <div style={{
          height     : '100%',
          background : '#fff'
        }}>
          <Host {...this.props} />
        </div>
      )}
        open      = {this.state.sidebarOpen}
        docked    = {this.state.sidebarDocked}
        onSetOpen = {this.onSetSidebarOpen.bind(this)}>
        <Mixer {...this.props} />
      </Sidebar>
    )
  }
}

export default Ui
