import userEvent from '@testing-library/user-event';
import React, { useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react'
const UseEffectDemoHook = () => {
  console.log('UseEffectDemoHook render');
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    console.log('UseEffectDemoHook useEffect callback', count);
    return () => {
      console.log('UseEffectDemoHook useEffect cleanup', count);
    }
  }, [count])

  useLayoutEffect(() => {
    console.log('UseEffectDemoHook useLayoutEffect callback', count);
    return () => {
      console.log('UseEffectDemoHook useLayoutEffect cleanup', count);
    }
  }, [count])

  return <div key="container">
    <div key="count-div">{count}</div>
    {/* {count > 1 ? <div id='more1' key="count-div-more-1">{count}</div> : null} */}
    {/* <div key="doubleCount-div">{doubleCount}</div> */}
    <button
      key="button"
      onClick={() => {
        // setDoubleCount(p  => p + 2);
        setCount(p => p + 1);
        // setTimeout(() => console.log('setTimeout'));
        // Promise.resolve().then(() => console.log('Promise then'));

      }}>+1</button>
  </div>
}

export default UseEffectDemoHook;
