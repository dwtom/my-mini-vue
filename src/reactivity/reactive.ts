import { mutableHandlers, readonlyHandlers } from './baseHandlers';

function createActiveObj(obj: any, handlers) {
  return new Proxy(obj, handlers);
}

export const reactive = (obj) => {
  return createActiveObj(obj, mutableHandlers);
};

export const readonly = (obj) => {
  return createActiveObj(obj, readonlyHandlers);
}
