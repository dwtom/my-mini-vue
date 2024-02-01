const queue: any[] = []; // 组件更新任务队列
const activePostFlushCbs: any[] = []; // watcheffect任务队列
let isFlushPending = false;

const p = Promise.resolve();

// nextTick本质上就是将任务放到微队列中执行(会等待同步任务执行结束后执行)
export function nextTick(fn?) {
  return fn ? p.then(fn) : p;
}

// 收集任务并在微队列中执行
export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}

// 收集watcheffect并执行
export function queuePostFlushCb(job) {
  activePostFlushCbs.push(job);
  queueFlush();
}

// 将任务推入微队列并执行
function queueFlush() {
  if (isFlushPending) {
    return;
  }
  isFlushPending = true;
  nextTick(() => {
    flushJobs();
  });
}

function flushJobs() {
  isFlushPending = false;
  flushPostFlushCbs();
  // 渲染组件
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}

// 执行watchEffect方法
function flushPostFlushCbs() {
  for (let i = 0; i < activePostFlushCbs.length; i++) {
    activePostFlushCbs[i]();
  }
}
