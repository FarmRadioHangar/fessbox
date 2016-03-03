import React from 'react'

import Toolbar 
  from 'material-ui/lib/toolbar/toolbar'
import ToolbarGroup 
  from 'material-ui/lib/toolbar/toolbar-group'
import ToolbarTitle 
  from 'material-ui/lib/toolbar/toolbar-title'

class ChannelToolbar extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { id, label } = this.props
    return (
      <Toolbar>
        <ToolbarGroup 
          firstChild = {true}
          float      = 'left'>
          <ToolbarTitle 
            text     = {id}
            style    = {styles.title}
          />
        </ToolbarGroup>
        <ToolbarGroup float='right'>
          <div style={styles.label}>{label && (
            <div style={styles.inner}>
              <i style={styles.icon} className='material-icons'>sim_card</i>
              {label}
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
