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
  // 将根节点绑定到当前的虚拟节点上便于后续绑定到this上调用
  const el = (vnode.el = document.createElement(vnode.type));
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

function mountComponent(initialVNode, container) {
  // 创建组件实例
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode: any, container: any) {
  const { proxy } = instance;
  // 从组件对象中剥离虚拟节点树
  // 这里的render是组件的render函数 返回的内容是h函数返回的内容
  // 使用call()绑定代理对象this 到组件内
  const subTree = instance.render.call(proxy);
  patch(subTree, container);

  // mountElement 将el绑定到了subTree
  // 再绑定到组件的el属性
  initialVNode.el = subTree.el;
}
