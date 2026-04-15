const calculateBackoff = ({ currentCount, limit, windowMs, queueDepth, queueLimit }) => {
  const utilization = limit === 0 ? 1 : currentCount / limit;

  if (currentCount < limit) {
    return { mode: 'pass', delayMs: 0, utilization };
  }

  if (queueDepth <= queueLimit) {
    const step = Math.min(queueDepth, 10);
    const delayMs = Math.min(Math.round((windowMs / limit) * step), 2000);
    return { mode: 'delay', delayMs, utilization };
  }

  return { mode: 'reject', delayMs: 0, utilization };
};

export default { calculateBackoff };
