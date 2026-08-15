const secretPatterns = [
  /(Bearer)\s+[^\s,;]+/gi,
  /(password|pass|secret|private[_ -]?key|token|uuid|authorization)\s*([:=])\s*([^\s,;]+)/gi,
];

/** Removes common credential shapes before a native engine event can enter the UI. */
export function redactDiagnosticMessage(message: string) {
  return secretPatterns.reduce((safe, pattern) => safe.replace(pattern, (match, key, separator) => {
    if (key?.toLowerCase?.() === "bearer") return "Bearer [redacted]";
    return `${key}${separator}[redacted]`;
  }), message);
}

export function buildDiagnosticEvent(level: "info" | "warning" | "error", message: string, createdAt = new Date().toISOString()) {
  return { level, message: redactDiagnosticMessage(message), createdAt };
}
