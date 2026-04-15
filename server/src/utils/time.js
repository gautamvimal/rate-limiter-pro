export const nowMs = () => Date.now();
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const seconds = (ms) => Math.ceil(ms / 1000);
