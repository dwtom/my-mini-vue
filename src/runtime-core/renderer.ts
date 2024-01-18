import { ShapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';

// 将渲染流程包装一层供不同平台自定义渲染
export function createRenderer(options) {
  const { createElement, patchProp, insert } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  // 处理vnode 方便递归处理
  // n1 - 旧的节点,初始化为null
  // m2 - 新的节点
  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment: // 只渲染children
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text: // 渲染文本
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理dom元素
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理component
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent);
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container, parentComponent);
    }
  }

  // 节点更新
  function patchElement(n1, n2, container, parentComponent) {
    console.log('patchElement');
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
      patch(null, child, container, parentComponent);
    });
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(initialVNode, container, parentComponent) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    effect(() => {
      const { proxy } = instance;
      if (!instance.isMounted) {
        // 从组件对象中剥离虚拟节点树
        // 这里的render是组件的render函数 返回的内容是h函数返回的内容
        // 使用call()绑定代理对象this 到组件内
        // 将subtree保存起来便于更新节点时比较
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance);

        // mountElement 将el绑定到了subTree
        // 再绑定到组件的el属性
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;

        // 节点更新subTree属性也要更新
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
