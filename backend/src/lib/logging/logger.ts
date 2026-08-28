type LogFields = Record<string, string | number | boolean | undefined>;

const BLOCKED = /phone|email|token|otp|code|dob|name|value|observation|ssn|mrn/i;

function sanitize(fields?: LogFields): LogFields | undefined {
  if (!fields) return undefined;
  const next: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (BLOCKED.test(key)) continue;
    next[key] = value;
  }
  return next;
}

export const logger = {
  info(message: string, fields?: LogFields) {
    console.info(JSON.stringify({ level: "info", message, ...sanitize(fields) }));
  },
  warn(message: string, fields?: LogFields) {
    console.warn(JSON.stringify({ level: "warn", message, ...sanitize(fields) }));
  },
  error(message: string, fields?: LogFields) {
    console.error(JSON.stringify({ level: "error", message, ...sanitize(fields) }));
  },
};
