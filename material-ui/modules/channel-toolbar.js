import React from 'react'

import Toolbar 
  from 'material-ui/lib/toolbar/toolbar'
import ToolbarGroup 
  from 'material-ui/lib/toolbar/toolbar-group'
import ToolbarTitle 
  from 'material-ui/lib/toolbar/toolbar-title'
import ToolbarSeparator 
  from 'material-ui/lib/toolbar/toolbar-separator'

class ChannelToolbar extends React.Component {
  render() {
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

const styles = {
  title: {
    padding         : '0 24px',
  },
  label: {
    lineHeight    : '56px',
    fontSize      : '14px',
    display       : 'inline-block',
    position      : 'relative',
    float         : 'left',
  },
  inner: {
    display       : 'flex', 
    flexDirection : 'row', 
    alignItems    : 'center',
    color         : 'rgba(0, 0, 0, 0.4)',
  },
  mode: {
    paddingLeft   : '16px',
    lineHeight    : '56px',
    fontSize      : '14px',
    display       : 'inline-block',
    position      : 'relative',
    float         : 'left',
  },
  icon: {
    marginRight   : '10px', 
  },
}

export default ChannelToolbar
