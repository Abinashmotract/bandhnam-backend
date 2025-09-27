import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Audit logger middleware
export const auditLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Override res.send to capture response
  res.send = function (data) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Ensure data is a string or Buffer for responseSize calculation
    let responseDataForSize = data;
    if (data && typeof data === "object" && !Buffer.isBuffer(data)) {
      try {
        responseDataForSize = JSON.stringify(data);
      } catch (e) {
        responseDataForSize = "[Unserializable object]";
      }
    }
    const auditLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      userId: req.user ? req.user._id : null,
      userRole: req.user ? req.user.role : null,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestBody: req.method !== "GET" ? sanitizeRequestBody(req.body) : null,
      responseSize: responseDataForSize ? Buffer.byteLength(responseDataForSize, "utf8") : 0
    };

    // Write to audit log file
    writeAuditLog(auditLog);

    // Call original send
    originalSend.call(this, data);
  };

  next();
};

// Sanitize request body to remove sensitive information
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== "object") return body;

  const sanitized = { ...body };
  const sensitiveFields = ["password", "otp", "token", "secret", "key"];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
};

// Write audit log to file
const writeAuditLog = (auditLog) => {
  try {
    const logFile = path.join(logsDir, `audit-${new Date().toISOString().split("T")[0]}.log`);
    const logEntry = JSON.stringify(auditLog) + "\n";
    
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error("Error writing audit log:", error);
  }
};

// Security event logger
export const securityLogger = (event, details) => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: getSeverityLevel(event)
  };

  try {
    const logFile = path.join(logsDir, `security-${new Date().toISOString().split("T")[0]}.log`);
    const logEntry = JSON.stringify(securityLog) + "\n";
    
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error("Error writing security log:", error);
  }
};

// Get severity level based on event type
const getSeverityLevel = (event) => {
  const highSeverityEvents = [
    "failed_login_attempts",
    "suspicious_activity",
    "unauthorized_access",
    "data_breach_attempt"
  ];

  const mediumSeverityEvents = [
    "password_reset",
    "account_locked",
    "unusual_activity"
  ];

  if (highSeverityEvents.includes(event)) return "HIGH";
  if (mediumSeverityEvents.includes(event)) return "MEDIUM";
  return "LOW";
};

// GDPR compliance logger
export const gdprLogger = (action, userId, details) => {
  const gdprLog = {
    timestamp: new Date().toISOString(),
    action, // "data_access", "data_deletion", "data_export", "consent_given", "consent_withdrawn"
    userId,
    details,
    compliance: "GDPR"
  };

  try {
    const logFile = path.join(logsDir, `gdpr-${new Date().toISOString().split("T")[0]}.log`);
    const logEntry = JSON.stringify(gdprLog) + "\n";
    
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error("Error writing GDPR log:", error);
  }
};
