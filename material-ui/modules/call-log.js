import React from 'react'

import Paper 
  from 'material-ui/lib/paper'
import Table 
  from 'material-ui/lib/table/table'
import TableHeaderColumn 
  from 'material-ui/lib/table/table-header-column'
import TableRow 
  from 'material-ui/lib/table/table-row'
import TableHeader 
  from 'material-ui/lib/table/table-header'
import TableRowColumn 
  from 'material-ui/lib/table/table-row-column'
import TableBody 
  from 'material-ui/lib/table/table-body'

class CallLog extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <Paper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>Number</TableHeaderColumn>
              <TableHeaderColumn>Contact</TableHeaderColumn>
              <TableHeaderColumn>Call time</TableHeaderColumn>
              <TableHeaderColumn>Duration</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableRowColumn style={styles.table.row}>
                <i className='material-icons' style={styles.table.icon}>call_made</i> 
                <span style={styles.table.phone}>
                  +255 719 131 023
                </span>
              </TableRowColumn>
              <TableRowColumn>John Smith</TableRowColumn>
              <TableRowColumn>1:01 PM Wednesday, March 2, 2016</TableRowColumn>
              <TableRowColumn>04:39</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={styles.table.row}>
                <i className='material-icons' style={styles.table.icon}>call_made</i> 
                <span style={styles.table.phone}>
                  +255 719 131 023
                </span>
              </TableRowColumn>
              <TableRowColumn>Randal White</TableRowColumn>
              <TableRowColumn>1:01 PM Wednesday, March 2, 2016</TableRowColumn>
              <TableRowColumn>05:42</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={styles.table.row}>
                <i className='material-icons' style={styles.table.icon}>call_received</i> 
                <span style={styles.table.phone}>
                  +255 719 131 023
                </span>
              </TableRowColumn>
              <TableRowColumn>Stephanie Sanders</TableRowColumn>
              <TableRowColumn>1:01 PM Wednesday, March 2, 2016</TableRowColumn>
              <TableRowColumn>00:32</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn style={styles.table.row}>
                <i className='material-icons' style={styles.table.icon}>call_received</i> 
                <span style={styles.table.phone}>
                  +255 719 131 023
                </span>
              </TableRowColumn>
              <TableRowColumn>Steve Brown</TableRowColumn>
              <TableRowColumn>1:01 PM Wednesday, March 2, 2016</TableRowColumn>
              <TableRowColumn>01:59</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    )
  }
}

const styles = {
  table: {
    row: {
      display      : 'flex',
    },
    phone: {
      flex         : 1, 
      alignSelf    : 'center',
    },
    icon: {
      alignSelf    : 'center', 

      marginRight  : '14px',
      paddingRight : '5px',
      borderRight  : '1px solid rgba(0, 0, 0, 0.15)',
      width        : '30px',
    },
  },
}

export default CallLog
