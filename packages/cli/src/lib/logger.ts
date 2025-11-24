type LogValue = string | number | boolean | object | null | undefined;
type LogArgs = LogValue[];

const COLORS = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
} as const;

function ts(): string {
  return COLORS.gray + new Date().toISOString() + COLORS.reset;
}

export class Logger {
  private scope: string;

  constructor(scope: string) {
    this.scope = scope;
  }

  private fmt(label: string, color: string, args: LogArgs) {
    const tag = `${color}${label}${COLORS.reset}`;
    return [ts(), tag, `[${this.scope}]`, ...args];
  }

  info(...args: LogArgs) {
    console.log(...this.fmt("INFO", COLORS.green, args));
  }

  warn(...args: LogArgs) {
    console.warn(...this.fmt("WARN", COLORS.yellow, args));
  }

  error(...args: LogArgs) {
    console.error(...this.fmt("ERROR", COLORS.red, args));
  }

  debug(...args: LogArgs) {
    if (process.env.DEBUG) {
      console.log(...this.fmt("DEBUG", COLORS.cyan, args));
    }
  }

  sucess(...args: LogArgs) {
    console.log(...this.fmt("SUCCESS", COLORS.green, args));
  }
}

export const logger = new Logger("global");
