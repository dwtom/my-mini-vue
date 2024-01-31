import { createRenderer } from '@mini-vue/runtime-core';

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, prevVal, nextVal) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  // 处理事件
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, nextVal);
  } else if ([null, undefined].includes(nextVal)) {
    // 如果属性值不存在，那么从节点上删除该属性
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextVal);
  }
}

function insert(child, parent, anchor) {
  // parent.appendChild(child);
  parent.insertBefore(child, anchor || null);
}

function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

function setElementText(el, text) {
  el.textContent = text;
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(...arg) {
  return renderer.createApp(...arg);
}

// runtime-core是基础层，runtime-dom是应用层
export * from '@mini-vue/runtime-core';
