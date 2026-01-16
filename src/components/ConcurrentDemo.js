import userEvent from '@testing-library/user-event';
import React, { useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react'
const UseEffectDemoHook = () => {
  console.log('UseEffectDemoHook render');
  const [count, setCount] = React.useState(0);

  

  return <div key="container">
    <div key="count-div">{count}</div>
    <button
      key="button"
      onClick={() => {
        setCount(p => p + 1);
        React.startTransition(() => {
          setCount(10);
        });
      }}>+1</button>
  </div>
}

export default UseEffectDemoHook;
