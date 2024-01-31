const queue: any[] = [];
let isFlushPending = false;

const p = Promise.resolve();

// nextTick本质上就是将任务放到微队列中执行(会等待同步任务执行结束后执行)
export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}

// 收集任务并在微队列中执行
export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
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
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}
