import { ShapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';

export function createRenderer(options) {
  const { createElement, patchProp, insert } = options;

  function render(vnode, container) {
    patch(vnode, container, null);
  }

  // 方便递归处理
  function patch(vnode, container, parentComponent) {
    const { type, shapeFlag } = vnode;
    switch (type) {
      case Fragment: // 只渲染children
        processFragment(vnode, container, parentComponent);
        break;
      case Text: // 渲染文本
        processText(vnode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理dom元素
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理component
          processComponent(vnode, container, parentComponent);
        }
        break;
    }
  }

  function processText(vnode: any, container: any) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode, container, parentComponent);
  }

  function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
  }

  // 为dom元素绑定html属性，事件等，并将dom元素及子元素放入父节点中
  function mountElement(vnode, container, parentComponent) {
    // vnode对象包含type,props,children 详见createVnode
    // 将根节点绑定到当前的虚拟节点上便于后续绑定到this上调用
    const el = (vnode.el = createElement(vnode.type));
    // 处理props
    for (const [key, val] of Object.entries(vnode.props ?? {})) {
      patchProp(el, key, val);
    }

    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本节点
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 包含多个子节点
      mountChildren(vnode, el, parentComponent);
    }

    // container.append(el);
    insert(el, container);
  }

  // 处理children
  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(child => {
      patch(child, container, parentComponent);
    });
  }

  function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
  }

  function mountComponent(initialVNode, container, parentComponent) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    const { proxy } = instance;
    // 从组件对象中剥离虚拟节点树
    // 这里的render是组件的render函数 返回的内容是h函数返回的内容
    // 使用call()绑定代理对象this 到组件内
    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);

    // mountElement 将el绑定到了subTree
    // 再绑定到组件的el属性
    initialVNode.el = subTree.el;
  }

  return {
    createApp: createAppAPI(render),
  };
}
