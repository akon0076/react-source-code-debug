# React Diff 算法综合案例详解

## 🎯 目标

通过一个包含**更新、删除、插入、移动**的综合案例，完整展示 Diff 算法的四轮遍历逻辑。

---

## 📌 场景一：第一轮遍历 - 节点更新

### 案例描述

```jsx
旧: [A, B, C]  (只是 props 变了)
新: [A, B, C]  (内容更新)
```

### 执行流程

| 步骤 | 当前位置 | 操作 | 关键判断 | lastPlacedIndex |
|------|---------|------|---------|----------------|
| 1 | newIdx=0<br>oldFiber=A | 对比 key | A === A ✅<br>复用，更新 props | 0 → 0 |
| 2 | newIdx=1<br>oldFiber=B | 对比 key | B === B ✅<br>复用，更新 props | 0 → 1 |
| 3 | newIdx=2<br>oldFiber=C | 对比 key | C === C ✅<br>复用，更新 props | 1 → 2 |

### 结果

```
✅ 第一轮遍历处理完所有节点
✅ 所有 fiber 都被复用，只更新 props
✅ 不需要移动、插入或删除任何 DOM
```

**不会进入第二、三、四轮遍历**

---

## 📌 场景二：第二轮遍历 - 删除节点

### 案例描述

```jsx
旧: [A, B, C, D]
新: [A, B]
```

### 执行流程

**第一轮遍历：**

| 步骤 | 当前位置 | 操作 | 结果 |
|------|---------|------|------|
| 1 | newIdx=0<br>oldFiber=A | A === A | ✅ 复用 A |
| 2 | newIdx=1<br>oldFiber=B | B === B | ✅ 复用 B |
| 3 | 循环结束 | newIdx=2<br>oldFiber=C | 🔚 newChildren 遍历完 |

**第二轮遍历：**

```
判断条件: newIdx === newChildren.length?
         2 === 2 ✅ 进入第二轮

操作: 删除剩余的 oldFiber (C, D)

流程:
  遍历 C → C.sibling(D) → null
  标记每个节点: flags |= Deletion
  添加到父节点的删除列表: returnFiber.deletions = [C, D]
```

### 结果

```
✅ 返回 fiber 链表: A → B
🗑️ 待删除节点: [C, D]
📌 在 commit 阶段会从 DOM 中移除 C 和 D
```

---

## 📌 场景三：第三轮遍历 - 插入节点

### 案例描述

```jsx
旧: [A, B]
新: [A, B, C, D]
```

### 执行流程

**第一轮遍历：**

| 步骤 | 当前位置 | 操作 | 结果 |
|------|---------|------|------|
| 1 | newIdx=0<br>oldFiber=A | A === A | ✅ 复用 A |
| 2 | newIdx=1<br>oldFiber=B | B === B | ✅ 复用 B |
| 3 | 循环结束 | newIdx=2<br>oldFiber=null | 🔚 oldFiber 遍历完 |

**第二轮检查：**

```
判断条件: newIdx === newChildren.length?
         2 === 4 ❌ 不满足，继续
```

**第三轮遍历：**

```
判断条件: oldFiber === null?
         true ✅ 进入第三轮

操作: 为剩余的 newChildren 创建新 fiber (C, D)

流程:
  newIdx=2: 创建 C fiber, 标记 flags |= Placement
  newIdx=3: 创建 D fiber, 标记 flags |= Placement
  构建链表: B.sibling = C, C.sibling = D
```

### 结果

```
✅ 返回 fiber 链表: A → B → C(Placement) → D(Placement)
➕ C 和 D 标记为插入
📌 在 commit 阶段会将 C 和 D 插入 DOM
```

---

## 📌 场景四：第四轮遍历 - 节点移动（最复杂）

### 案例描述

```jsx
旧: [A, B, C, D]  (index: 0, 1, 2, 3)
新: [A, C, E, B]
```

### 可视化对比

```
旧列表:  A(0) → B(1) → C(2) → D(3)
新列表:  A(0) → C(1) → E(2) → B(3)

变化:
  ✅ A: 位置不变
  🔄 C: 从位置 2 移到位置 1
  ➕ E: 新插入到位置 2
  🔄 B: 从位置 1 移到位置 3
  🗑️ D: 被删除
```

### 执行流程

**第一轮遍历：**

| 步骤 | newIdx | oldFiber | newChild | key比较 | 结果 |
|------|--------|----------|----------|---------|------|
| 1 | 0 | A | A | A === A ✅ | 复用 A，lastPlacedIndex=0 |
| 2 | 1 | B | C | B !== C ❌ | 跳出第一轮！ |

**状态记录：**
```
newIdx = 1
oldFiber = B (还有 B、C、D 未处理)
lastPlacedIndex = 0
```

**第二轮检查：**
```
newIdx === newChildren.length?
1 === 4 ❌ 不满足
```

**第三轮检查：**
```
oldFiber === null?
false ❌ 不满足 (oldFiber = B)
```

**第四轮遍历（使用 Map）：**

**步骤 1: 构建 Map**

```
遍历剩余 oldFiber: B → C → D

Map 结构:
{
  'B': B(index=1),
  'C': C(index=2),
  'D': D(index=3)
}
```

**步骤 2: 处理剩余 newChildren**

| 轮次 | newIdx | newChild | Map查找 | oldIndex | lastPlacedIndex | 移动判断 | 操作 |
|------|--------|----------|---------|----------|----------------|---------|------|
| 1 | 1 | C | 找到 C(2) | 2 | 0 | 2≥0 ✅<br>不移动 | 复用 C<br>从 Map 删除 C<br>lastPlacedIndex=2 |
| 2 | 2 | E | 未找到 | - | 2 | - | 创建新 fiber E<br>标记 Placement<br>lastPlacedIndex=2 |
| 3 | 3 | B | 找到 B(1) | 1 | 2 | 1<2 🚨<br>**需要移动！** | 复用 B<br>标记 Placement<br>从 Map 删除 B<br>lastPlacedIndex=2 |

**步骤 3: 删除 Map 中剩余节点**

```
Map 中剩余: { 'D': D(3) }
操作: 标记 D 为删除 (Deletion)
```

### 关键逻辑：为什么 B 需要移动？

```
┌─────────────────────────────────────────────────────┐
│ 核心算法：oldIndex < lastPlacedIndex 则需要移动     │
└─────────────────────────────────────────────────────┘

处理 C 时:
  oldIndex = 2 (C 在旧列表的位置)
  lastPlacedIndex = 0
  判断: 2 >= 0 ✅ 不移动
  更新: lastPlacedIndex = 2

处理 B 时:
  oldIndex = 1 (B 在旧列表的位置)
  lastPlacedIndex = 2
  判断: 1 < 2 🚨 需要移动！
  
  解释: B 原本在位置 1，C 原本在位置 2
       现在 C 已经被放置了（lastPlacedIndex=2）
       B 的 oldIndex=1 < 2，说明 B 原本在 C 前面
       但新列表中 B 应该在 C 后面
       所以 B 需要移动！
```

### lastPlacedIndex 变化追踪

```
初始: lastPlacedIndex = 0

第一轮遍历:
  A: oldIndex=0 >= 0 → lastPlacedIndex = 0

第四轮遍历:
  C: oldIndex=2 >= 0 → lastPlacedIndex = 2
  E: 新节点         → lastPlacedIndex = 2 (不变)
  B: oldIndex=1 < 2 → lastPlacedIndex = 2 (不变，但标记移动)
```

### 最终结果

**返回的 fiber 链表：**
```
A → C → E(Placement) → B(Placement)
```

**待删除列表：**
```
returnFiber.deletions = [D]
```

**DOM 操作（commit 阶段）：**
```
1. 删除 D
2. 插入 E 到 C 后面
3. 移动 B 到 E 后面（最后）
```

**为什么 React 选择移动 B 而不是移动 C？**

```
方案1（React的选择）: 移动 B
  保持 A、C 不动
  移动 B 到后面
  → 1 次移动操作

方案2（备选方案）: 移动 C
  保持 A、B 不动
  移动 C 到 A 后面
  → 1 次移动操作

React 选择方案1的原因:
  通过 lastPlacedIndex 算法自动确定
  策略: 保持相对位置靠后的节点不动
         只移动相对位置靠前的节点
```

---

## 🎯 四轮遍历总结

### 触发条件表

| 遍历轮次 | 触发条件 | 主要场景 | 操作 |
|---------|---------|---------|------|
| **第一轮** | 始终执行 | 节点更新 | 从左到右对比，key 相同就复用 |
| **第二轮** | `newIdx === newChildren.length` | 节点删除 | 删除剩余的 oldFiber |
| **第三轮** | `oldFiber === null` | 节点插入 | 创建剩余的 newChildren |
| **第四轮** | 既有 oldFiber<br>又有 newChildren | 节点移动 | 使用 Map 查找并判断移动 |

### 核心算法流程图

```
开始 Diff
    ↓
┌──────────────────────┐
│  第一轮遍历           │
│  (处理节点更新)       │
│  同时遍历 old 和 new  │
│  key 相同就复用       │
└──────────────────────┘
    ↓
newIdx === length?  ──YES→ ┌──────────────────┐
    │                      │  第二轮遍历       │
    NO                     │  删除剩余 old     │
    ↓                      └──────────────────┘
oldFiber === null?  ──YES→ ┌──────────────────┐
    │                      │  第三轮遍历       │
    NO                     │  插入剩余 new     │
    ↓                      └──────────────────┘
┌──────────────────────┐
│  第四轮遍历           │
│  1. 构建 Map         │
│  2. 从 Map 查找复用  │
│  3. 判断是否移动     │
│  4. 删除未复用节点   │
└──────────────────────┘
    ↓
返回新 fiber 链表
```

---

## 💡 核心要点

### 1. lastPlacedIndex 的含义

> 最后一个已处理且可复用节点在**旧列表**中的位置

**作用**: 判断当前节点是否需要移动
- `oldIndex >= lastPlacedIndex` → 不移动，更新 lastPlacedIndex
- `oldIndex < lastPlacedIndex` → 需要移动，保持 lastPlacedIndex

### 2. 为什么用 Map？

```
问题: 第四轮遍历时，需要在剩余 oldFiber 中查找匹配的节点

不用 Map:
  for newChild in newChildren:
    for oldFiber in oldFibers:
      if match: break
  时间复杂度: O(n²)

使用 Map:
  Map { key: fiber }
  查找复杂度: O(1)
  总时间复杂度: O(n)
```

### 3. key 的重要性

```
没有 key:
  旧: [<div>A</div>, <div>B</div>, <div>C</div>]
  新: [<div>C</div>, <div>A</div>, <div>B</div>]
  
  React 只能按位置对比:
    位置0: A → C (更新内容)
    位置1: B → A (更新内容)
    位置2: C → B (更新内容)
  结果: 3次更新

有 key:
  旧: [<div key="A">A</div>, <div key="B">B</div>, <div key="C">C</div>]
  新: [<div key="C">C</div>, <div key="A">A</div>, <div key="B">B</div>]
  
  React 通过 key 识别:
    A: 复用
    B: 复用
    C: 复用并移动
  结果: 只需移动 DOM 位置，不更新内容
```

### 4. 性能优化策略

**React 的优化策略：**

1. **分层比较**: 只比较同层节点，不跨层比较
2. **优先处理简单情况**: 第一轮快速处理位置不变的更新
3. **提前退出**: 第二、三轮及时处理单边剩余
4. **Map 优化查找**: 第四轮使用 Map 降低查找复杂度
5. **最小化移动**: 通过 lastPlacedIndex 算法减少移动次数

**开发建议：**

1. ✅ 使用稳定的 key（不要用 index）
2. ✅ 保持列表顺序相对稳定
3. ✅ 避免在列表中频繁插入/删除头部元素
4. ❌ 不要在 key 中使用随机值或不稳定的值

---

## 📚 相关函数职责

| 函数 | 职责 | 使用场景 |
|-----|------|---------|
| `updateSlot()` | 尝试在相同位置复用 | 第一轮遍历，key 必须相同 |
| `mapRemainingChildren()` | 构建 oldFiber 的 Map | 第四轮遍历开始时 |
| `updateFromMap()` | 从 Map 中查找并复用 | 第四轮遍历，可以不同位置 |
| `placeChild()` | 判断是否需要移动 | 所有遍历中标记位置 |
| `createChild()` | 创建新 fiber | 第三、四轮遍历处理新节点 |
| `deleteChild()` | 标记删除 | 第二、四轮遍历删除旧节点 |

---

## 🎓 总结

通过这个综合案例，我们完整展示了 React Diff 算法的四轮遍历：

1. **第一轮**：处理简单的位置对应更新（最常见）
2. **第二轮**：批量删除多余节点
3. **第三轮**：批量插入新节点
4. **第四轮**：使用 Map 处理复杂的位置变化

核心思想：**逐层深入，逐步优化**，用最少的 DOM 操作完成更新。

