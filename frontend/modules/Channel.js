import React from 'react'

class Channel extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { channelId } = this.props
    return (
      <div>
        {channelId}
      </div>
    )
  }
}

export default Channel
