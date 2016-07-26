import React from 'react'
import Badge from 'material-ui/Badge'

const styles = {
  badge: {
    position    : 'absolute',
    marginTop   : '-11px',
    marginLeft  : '-19px',
  },
  icon: {
    fontSize    : '12pt', 
    marginTop   : '1px',
  },
}

const icon = (props) => (
  <span>
    <i className='material-icons'>volume_up</i>
    <Badge
      style        = {styles.badge}
      primary      = {true}
      badgeContent = {
        <i style={styles.icon} className='material-icons faa-ring animated'>
          notifications_active
        </i>
      }
    />
  </span>
)

export default icon
