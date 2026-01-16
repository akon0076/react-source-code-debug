import userEvent from '@testing-library/user-event';
import React, { useMemo, useCallback, useEffect, useRef, useLayoutEffect } from 'react'
// const SetStateDemoHooks = () => {
//   const [count, setCount] = React.useState(0);
//   const countRef = useRef(count);

//   const doubleCount = useMemo(() => {
//     return count * 2;
//   }, [count])

//   const handleCountClick = useCallback(() => {
//     setCount(p => p + 1);
//   }, []);

//   useEffect(() => {
//     console.log('SetStateDemoHooks mount', count);
//     return () => {
//       console.log('SetStateDemoHooks unmount', count);
//     }
//   }, [])

//   useEffect(() => {
//     console.log('SetStateDemoHooks useEffect');
//     return () => {
//       console.log('SetStateDemoHooks useEffect return', count);
//     }
//   })

//   useEffect(() => {
//     console.log('count useEffect', count);
//     countRef.current = count;
//     return () => {
//       console.log('count useEffect return', count);
//     }
//   }, [count])

//   return <div key="container">
//     <div key="count-div">{count}</div>
//     <div key="doubleCount-div">{doubleCount}</div>
//       <button
//         key="button"
//         onClick={handleCountClick}>增加1</button>
//     </div>
// }

const SetStateDemoHooks = () => {
  console.log('SetStateDemoHooks render');
  const [count, setCount] = React.useState(0);
  // const [doubleCount, setDoubleCount] = React.useState(0);

  /** useEffect useLayoutEffect 异步验证 */
  // console.log('uef render start');
  // useEffect(() => {
  //   console.log('uef: count, doubleCount', count, doubleCount);
  //   return () => {
  //     console.log('uef return', count, doubleCount)
  //   }
  // }, [count, doubleCount])
  // console.log('uef render end');

  // console.log('ulef render start');
  // useLayoutEffect(() => {
  //   console.log('ulef: count, doubleCount', count, doubleCount);
  //   return () => {
  //     console.log('ulef return', count, doubleCount)
  //   }
  // }, [count, doubleCount])
  // console.log('ulef render end');

  // const [end] = React.useState('end');

  // useEffect(() => {
  //   console.log('useEffect more1', document.getElementById('more1')?.innerHTML);
  //   return () => {
  //     console.log('useEffect return');
  //   }  }, [count])

  // useLayoutEffect(() => {
  //   console.log('useLayoutEffect more1', document.getElementById('more1')?.innerHTML);
  //   return () => {
  //     console.log('useLayoutEffect return');
  //   }
  // },[count])

  return <div key="container">
    <div key="count-div">{count.toString('2')}</div>
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

export default SetStateDemoHooks;
