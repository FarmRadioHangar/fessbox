import React  from 'react'
import styles from '../styles/channel-toolbar'

import Toolbar 
  from 'material-ui/Toolbar/Toolbar'
import ToolbarGroup 
  from 'material-ui/Toolbar/ToolbarGroup'
import ToolbarTitle 
  from 'material-ui/Toolbar/ToolbarTitle'
import ToolbarSeparator 
  from 'material-ui/Toolbar/ToolbarSeparator'

class ChannelToolbar extends React.Component {
  render() {
    //console.log('render channel toolbar')
    const { id, label, mode, contact, timer } = this.props
    return (
      <Toolbar style={{background: 'none'}}>
        <ToolbarGroup 
          firstChild = {true}
          float      = 'left'>
          {timer && (
            <div style={styles.inner}>
              {timer}
            </div>
          )}
          {'defunct' == mode && (
            <div style={{marginLeft: '20px', ...styles.inner}}>Defunct channel</div>
          )}
          {'on_hold' == mode && (
            <div style={{marginLeft: '20px', ...styles.inner}}>On hold</div>
          )}
        </ToolbarGroup>
        <ToolbarGroup float='right'>
          <div style={styles.label}>{label && (
            <div style={styles.inner}>
              {`${id}: ${label}`}
            </div>
          )}</div>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}

export default ChannelToolbar
