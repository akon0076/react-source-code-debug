import React from 'react'
class SetStateDemo extends React.Component {
  state = {
    count: 0
  }
  componentDidMount() {
  }
  handleButtonClick = () => {
    this.setState( prevState => {
      return { count: prevState.count + 2 }
    } )
  }
  render() {
    return <div key="container">
      <div key="count-div">{this.state.count}</div>
      <button
        key="button"
        onClick={() => {
        // debugger;
        this.setState({ count: this.state.count + 1 });
      }}>增加1</button>
    </div>
  }
}
export default SetStateDemo
