# React Diff 算法详解

## 📍 核心函数位置

文件：`src/react/v17/react-reconciler/src/ReactChildFiber.old.js`  
函数：`reconcileChildrenArray` (已添加详细中文注释)

## 🎯 Diff 算法的目标

对比**新旧子节点数组**，尽可能**复用旧的 Fiber 节点**，减少 DOM 操作，提高性能。

## 📊 参数说明

```javascript
reconcileChildrenArray(
  returnFiber,        // Work in Progress tree 上的父 fiber（正在构建的新树）
  currentFirstChild,  // Current tree 上的第一个子 fiber（旧树，当前屏幕显示的）
  newChildren,        // 新的 ReactElement 数组（即将要渲染的内容）
  lanes              // 优先级相关
)
```

### 关键概念
- **`currentFirstChild`**: 来自 **Current Fiber Tree**（旧树）
- **`returnFiber`**: 来自 **Work in Progress Tree**（新树）
- **双缓存机制**: React 维护两棵树，通过 Diff 算法决定如何从旧树构建新树

## 🔥 Diff 算法的 4 轮遍历

### 第一轮：处理节点更新 ⚡

**目标**: 从左到右逐个对比，处理相同位置、相同 key 的节点更新

**流程**:
```javascript
// 旧: [A, B, C, D]
// 新: [A, B, C, E]
//      ✅ ✅ ✅ ❌  <- A、B、C 位置和 key 都相同，直接更新；遇到 E 时 key 不同，跳出第一轮
```

**代码逻辑**:
```javascript
for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
  const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
  
  if (newFiber === null) {
    // key 不同，跳出第一轮遍历
    break;
  }
  
  // 标记位置，构建 fiber 链表
  lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
  previousNewFiber.sibling = newFiber;
}
```

**退出条件**:
1. `oldFiber === null` (旧节点遍历完)
2. `newIdx === newChildren.length` (新节点遍历完)
3. `newFiber === null` (key 不同，无法复用)

---

### 第二轮：删除剩余的旧节点 🗑️

**场景**: 新子节点已经全部处理完，但旧子节点还有剩余

**示例**:
```javascript
// 旧: [A, B, C, D]
// 新: [A, B]
// 结果: 删除 C、D
```

**代码逻辑**:
```javascript
if (newIdx === newChildren.length) {
  // 删除所有剩余的 oldFiber
  deleteRemainingChildren(returnFiber, oldFiber);
  return resultingFirstChild; // ✅ Diff 结束
}
```

---

### 第三轮：插入剩余的新节点 ➕

**场景**: 旧子节点已经全部处理完，但新子节点还有剩余

**示例**:
```javascript
// 旧: [A, B]
// 新: [A, B, C, D]
// 结果: 插入 C、D
```

**代码逻辑**:
```javascript
if (oldFiber === null) {
  // 为剩余的 newChildren 创建新的 fiber 节点
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
    // 构建链表...
  }
  return resultingFirstChild; // ✅ Diff 结束
}
```

---

### 第四轮：处理节点移动（最复杂）🔄

**场景**: 既有旧节点又有新节点，且第一轮因为 key 不同而中断

**示例**:
```javascript
// 旧: [A, B, C, D]
// 新: [A, C, B, D]
// 分析: A 匹配后，遇到 C（key 不同），进入第四轮
//       使用 Map 查找，B 和 C 位置互换
```

**核心步骤**:

#### 步骤 1: 构建 Map
```javascript
// 将剩余的 oldFiber 放入 Map
// Map 结构: { key/index: fiber }
const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

// 例如: Map { 'B': fiberB, 'C': fiberC, 'D': fiberD }
```

#### 步骤 2: 遍历剩余新节点，从 Map 中查找
```javascript
for (; newIdx < newChildren.length; newIdx++) {
  // 从 Map 中查找可复用的 fiber
  const newFiber = updateFromMap(existingChildren, ...);
  
  if (newFiber !== null) {
    // 复用成功，从 Map 中删除
    if (newFiber.alternate !== null) {
      existingChildren.delete(newFiber.key || newIdx);
    }
    
    // 🔑 判断是否需要移动
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
  }
}
```

#### 步骤 3: 删除 Map 中剩余的节点
```javascript
// Map 中剩余的都是在新列表中不存在的，需要删除
existingChildren.forEach(child => deleteChild(returnFiber, child));
```

---

## 🔑 节点移动的判断逻辑

### lastPlacedIndex 的作用

**`lastPlacedIndex`**: 最后一个可复用节点在旧列表中的位置索引

**判断规则**:
```javascript
function placeChild(newFiber, lastPlacedIndex, newIndex) {
  newFiber.index = newIndex;
  
  const current = newFiber.alternate; // 旧 fiber
  if (current !== null) {
    const oldIndex = current.index; // 旧位置
    
    if (oldIndex < lastPlacedIndex) {
      // 🚨 旧位置 < lastPlacedIndex，节点需要向右移动
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    } else {
      // ✅ 旧位置 >= lastPlacedIndex，节点不需要移动
      return oldIndex;
    }
  } else {
    // 新创建的节点，标记为插入
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }
}
```

### 移动示例

```javascript
// 旧: A(0) B(1) C(2) D(3)
// 新: A    C    B    D

// 第一轮遍历:
// A: oldIndex=0, lastPlacedIndex=0 -> 不移动，lastPlacedIndex=0

// 第四轮遍历（从 Map 查找）:
// C: oldIndex=2, lastPlacedIndex=0 -> 2 > 0，不移动，lastPlacedIndex=2
// B: oldIndex=1, lastPlacedIndex=2 -> 1 < 2，需要移动！标记 Placement
// D: oldIndex=3, lastPlacedIndex=2 -> 3 > 2，不移动，lastPlacedIndex=3

// 结果: 只移动 B，将 B 移到 C 后面
```

---

## 💡 为什么需要 key？

### 没有 key 的情况
```javascript
// 旧: [<div>A</div>, <div>B</div>, <div>C</div>]
// 新: [<div>C</div>, <div>A</div>, <div>B</div>]

// 没有 key，React 无法识别节点对应关系
// 只能按位置对比：位置 0 的节点从 A 变成 C，位置 1 从 B 变成 A...
// 结果：所有节点都需要更新 DOM 内容
```

### 有 key 的情况
```javascript
// 旧: [<div key="A">A</div>, <div key="B">B</div>, <div key="C">C</div>]
// 新: [<div key="C">C</div>, <div key="A">A</div>, <div key="B">B</div>]

// 有 key，React 可以识别节点对应关系
// 通过 Map 查找，发现 A、B、C 都可以复用
// 结果：只需要移动 DOM 位置，不需要更新内容
```

---

## 📈 性能优化策略

### 1. 优先处理简单情况（第一轮）
- 大多数情况下，节点只是 props 更新，位置不变
- 第一轮遍历可以快速处理这些情况

### 2. 提前退出（第二、三轮）
- 如果第一轮后，一方已经遍历完，直接处理剩余节点
- 避免不必要的 Map 构建

### 3. 使用 Map 优化查找（第四轮）
- 当节点位置发生变化时，使用 Map 将查找复杂度从 O(n²) 降低到 O(n)

### 4. 最小化移动操作
- 通过 `lastPlacedIndex` 算法，尽可能减少节点移动次数
- 只移动相对位置靠前的节点

---

## 🎓 总结

1. **Diff 算法的核心**: 通过 4 轮遍历，分别处理更新、删除、插入、移动四种情况
2. **currentFirstChild**: 来自 Current Fiber Tree（旧树）
3. **key 的重要性**: 让 React 能够准确识别节点，提高复用率
4. **lastPlacedIndex**: 用于判断节点是否需要移动的关键变量
5. **性能优化**: 优先处理简单情况，使用 Map 优化查找，最小化移动操作

---

## 📚 相关代码

- `reconcileChildrenArray`: Diff 算法主函数
- `updateSlot`: 尝试更新当前位置的节点
- `mapRemainingChildren`: 构建 oldFiber 的 Map
- `updateFromMap`: 从 Map 中查找并复用节点
- `placeChild`: 判断节点是否需要移动
- `deleteChild`: 标记节点为删除

