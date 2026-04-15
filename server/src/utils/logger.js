const format = (level, message, meta) => {
  const stamp = new Date().toISOString();
  const suffix = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${stamp}] [${level.toUpperCase()}] ${message}${suffix}`;
};

const logger = {
  info: (message, meta) => console.log(format('info', message, meta)),
  warn: (message, meta) => console.warn(format('warn', message, meta)),
  error: (message, meta) => console.error(format('error', message, meta)),
  debug: (message, meta) => console.debug(format('debug', message, meta))
};

export default logger;
