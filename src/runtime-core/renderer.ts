import { ShapeFlags } from '../shared/shapeFlags';
import { createComponentInstance, setupComponent } from './component';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';
import { EMPTY_OBJ } from '../shared';

// 将渲染流程包装一层供不同平台自定义渲染
export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null, null);
  }

  // 处理vnode 方便递归处理
  // n1 - 旧的节点,初始化为null
  // n2 - 新的节点
  function patch(n1, n2, container, parentComponent, anchor) {
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment: // 只渲染children
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text: // 渲染文本
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理dom元素
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理component
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  // 节点更新
  function patchElement(n1, n2, container, parentComponent, anchor) {
    // console.log('patchElement');
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el);
    // 更新children
    patchChildren(n1, n2, el, parentComponent, anchor);
    // 处理节点的props更新
    patchProps(el, oldProps, newProps);
  }

  // 更新children
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c1 = n1.children;
    const c2 = n2.children;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // arraychildren->textchildren
      if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 删除老的children
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        // 渲染文本节点
        // text -> text 也走到这里
        hostSetElementText(container, c2);
      }
    } else {
      // 新节点是数组节点
      // text -> array
      if (prevShapFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '');
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  // 对比算法
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length;
    let i = 0; // 指针
    let e1 = c1.length - 1; // 老的最后一个索引
    let e2 = l2 - 1; // 新的最后一个索引

    // 比较两个节点是否一致
    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 从左侧开始对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    // 从右侧开始对比(从右侧左移)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 新的比老的多，创建新节点
    if (i > e1) {
      if (i <= e2) {
        const nextPos = i + 1;
        const anchor = i + 1 < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    }
  }

  // 删除节点
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }

  // 更新节点的props
  function patchProps(el, oldProps, newProps) {
    // https://github.com/vuejs/core/pull/5857
    // vue3会在编译阶段对静态props进行提升，最终此处比较的会是同一个对象的引用
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          // 处理属性被删除的情况
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  // 为dom元素绑定html属性，事件等，并将dom元素及子元素放入父节点中
  function mountElement(vnode, container, parentComponent, anchor) {
    // vnode对象包含type,props,children 详见createVnode
    // 将根节点绑定到当前的虚拟节点上便于后续绑定到this上调用
    const el = (vnode.el = hostCreateElement(vnode.type));
    // 处理props
    for (const [key, val] of Object.entries(vnode.props ?? {})) {
      hostPatchProp(el, key, null, val);
    }

    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本节点
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 包含多个子节点
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    // container.append(el);
    hostInsert(el, container, anchor);
  }

  // 处理children
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(child => {
      patch(null, child, container, parentComponent, anchor);
    });
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor);
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(
    instance: any,
    initialVNode: any,
    container: any,
    anchor
  ) {
    effect(() => {
      const { proxy } = instance;
      if (!instance.isMounted) {
        // 从组件对象中剥离虚拟节点树
        // 这里的render是组件的render函数 返回的内容是h函数返回的内容
        // 使用call()绑定代理对象this 到组件内
        // 将subtree保存起来便于更新节点时比较
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance, anchor);

        // mountElement 将el绑定到了subTree
        // 再绑定到组件的el属性
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;

        // 节点更新subTree属性也要更新
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
