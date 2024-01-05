// render时区分虚拟节点类型
// 位运算效率高
export enum ShapeFlags {
  // dom元素
  ELEMENT = 1, // 0001
  // 组件
  STATEFUL_COMPONENT = 1 << 1, // 0010
  // 单文本节点
  TEXT_CHILDREN = 1 << 2, // 0100
  // 多个子节点
  ARRAY_CHILDREN = 1 << 3, // 1000
}

// 0-false; 1-true

// 写入 按位或
// ELEMENT | TEXT_CHILDREN => 0001 | 0100 => 0101

// 读取 按位与
// (ELEMENT |= TEXT_CHILDREN) & TEXT_CHILDREN => 0101 & 0100 => 0100
