import React   from 'react'
import Host    from './Host'
import mixer   from './Mixer'
import Stream  from './Stream'

import Sidebar from 'react-sidebar'

import { connect } 
  from 'react-redux'

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
    const Mixer = connect(state => {
      return {
        mixer  : state.mixer,
        client : state.client
      }
    })(mixer)
    return (
      <Sidebar 
        sidebar = {(
          <div style={{
            height     : '100%',
            background : '#fff'
          }}>
            <Host />
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

        //<Stream />

//      <Drawer width='180px' style={{backgroundColor: '#fff'}} contents={<Host />}>
//        <Mixer />
//        <Stream />
//      </Drawer>

//      <div>
//        <div className='demo-layout-transparent mdl-layout mdl-js-layout mdl-layout--fixed-drawer'>
//          <header className='mdl-layout__header mdl-layout__header--transparent'>
//            <div className='mdl-layout__header-row'></div>
//          </header>
//          <div className='mdl-layout__drawer'>
//            <Host />
//          </div>
//          <main className='mdl-layout__content'>
//            <Mixer />
//            <Stream />
//          </main>
//        </div>
//      </div>

//        <Drawer width='180px' style={{backgroundColor: '#fff'}} contents={<Host />}>
//          <Mixer />
//          <Stream />
//        </Drawer>

export default Ui
