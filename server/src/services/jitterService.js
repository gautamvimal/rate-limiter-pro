const getJitterDelay = (minMs = 20, maxMs = 150) => {
  if (maxMs <= minMs) return minMs;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
};

export default { getJitterDelay };
