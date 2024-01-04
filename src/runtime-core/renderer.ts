import { isObject } from '../shared';
import { createComponentInstance, setupComponent } from './component';

export function render(vnode, container) {
  patch(vnode, container);
}

// 方便递归处理
function patch(vnode, container) {
  if (typeof vnode.type === 'string') {
    // 处理dom元素
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    // 处理component
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}

function mountElement(vnode, container) {
  // vnode对象包含type,props,children 详见createVnode
  const el = document.createElement(vnode.type);
  // 处理props
  for (const [key, val] of Object.entries(vnode.props ?? {})) {
    el.setAttribute(key, val);
  }
  // 处理children
  mountChildren(vnode, el);

  container.append(el);
}

// 生成元素的子元素
function mountChildren(vnode, container) {
  const { children } = vnode;
  if (typeof children === 'string') {
    // 文本节点
    container.textContent = children;
  } else if (Array.isArray(children)) {
    // 包含多个子节点
    children.forEach(child => {
      patch(child, container);
    });
  }
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
  // 创建组件实例
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render(); // 虚拟节点树
  patch(subTree, container);
}
