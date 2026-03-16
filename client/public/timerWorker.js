// timerWorker.js — public/ folder mein rakhna hai
// Web Worker main thread se alag thread mein chalta hai
// Browser isko throttle nahi kar sakta chahe tab background mein ho

let interval = null;

self.onmessage = (e) => {
  if (e.data === "start") {
    if (interval) return;
    interval = setInterval(() => {
      self.postMessage("tick");
    }, 1000);
  }

  if (e.data === "stop") {
    clearInterval(interval);
    interval = null;
  }
};
