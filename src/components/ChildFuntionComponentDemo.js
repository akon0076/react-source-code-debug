import userEvent from '@testing-library/user-event';
import React, { useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react'
const ChildFuntionComponentDemo = (props) => {
  console.log('ChildFuntionComponentDemo render start --');
  const doubleCount = useMemo(() => {
    return props.count * 2;
  }, [props.count])
  console.log('ChildFuntionComponentDemo render end --');
  return <div key="container">
    <div key="doubleCount-div">{doubleCount}</div>
  </div>
}
const ChildFuntionComponentParentDemo = () => {
  console.log('ChildFuntionComponentParentDemo render start --');
  const [count, setCount] = React.useState(0);

  console.log('ChildFuntionComponentParentDemo render end --');
  return <div key="container">
    <div key="count-div">{count}</div>
    <ChildFuntionComponentDemo count={count} />
    <button
      key="button"
      onClick={() => {
        setCount(p => p + 1);
      }}>+1</button>
  </div>
}

export default ChildFuntionComponentParentDemo;
