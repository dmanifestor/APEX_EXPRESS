/**
 * Apex Logistics - Authentication & Dispatch Authorization Middleware
 * File: middleware/auth.js
 * 
 * Protects parcel status mutation endpoints, validates tracking identifiers,
 * and enforces role-based logistics actions (Dispatchers vs. Customs Officers).
 */

const AUTHORIZED_CREDENTIALS = {
  // Global Dispatcher Key
  'APEX-DISPATCH-990': {
    userId: 'agent_01',
    name: 'Markus Vance',
    role: 'dispatcher',
    station: 'FRA-HUB-01',
    allowedTransitions: ['in_transit', 'out_for_delivery', 'delivered']
  },
  // Cairo Customs Clearance Officer Key
  'EGY-CUST-AUTH-41': {
    userId: 'customs_eg_77',
    name: 'Tariq Al-Farouk',
    role: 'customs_officer',
    station: 'CAI-T2-CUSTOMS',
    allowedTransitions: ['on_hold', 'in_transit'] // Can place on hold or release hold
  },
  // Universal Demo Admin Key
  'DEMO-KEY-2026': {
    userId: 'demo_supervisor',
    name: 'Logistics Supervisor',
    role: 'supervisor',
    station: 'GLOBAL-OPS',
    allowedTransitions: ['in_transit', 'on_hold', 'out_for_delivery', 'delivered']
  }
};

/**
 * Validates tracking ID formatting (e.g. DELI01474, DELI08821, EGYP99402)
 */
function isValidParcelCode(code) {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim().toUpperCase();
  // Accepts standard courier format: 3-4 letters followed by 4-7 alphanumeric chars
  return /^[A-Z]{3,5}[0-9A-Z]{4,8}$/.test(clean);
}

/**
 * Express middleware to authenticate logistics staff
 */
function authenticateAgent(req, res, next) {
  // Check headers: Authorization: Bearer <key> or x-agent-key
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-agent-key'] || req.headers['x-dispatcher-token'];
  
  let token = customHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // Also allow query token for easy browser simulation
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access Denied: Missing logistics credentials (x-agent-key or Bearer token).'
    });
  }

  const agent = AUTHORIZED_CREDENTIALS[token];
  if (!agent) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid authorization token. Please provide an active dispatcher or customs officer credential.'
    });
  }

  req.agent = agent;
  next();
}

/**
 * Middleware to validate parcel tracking status update payload
 */
function validateStatusUpdate(req, res, next) {
  const { parcelId, newStatus, remarks } = req.body || {};

  if (!parcelId || !isValidParcelCode(parcelId)) {
    return res.status(400).json({
      error: 'InvalidParcelId',
      message: 'Invalid or missing parcel tracking ID. Expected format like DELI01474 or EGYP99402.'
    });
  }

  const validStatuses = ['in_transit', 'on_hold', 'out_for_delivery', 'delivered'];
  if (!newStatus || !validStatuses.includes(newStatus)) {
    return res.status(400).json({
      error: 'InvalidStatus',
      message: `Invalid status. Allowed statuses are: ${validStatuses.join(', ')}`
    });
  }

  // Enforce role-based permission
  if (req.agent && req.agent.allowedTransitions) {
    if (!req.agent.allowedTransitions.includes(newStatus)) {
      return res.status(403).json({
        error: 'PermissionDenied',
        message: `Agent ${req.agent.name} (${req.agent.role}) is not authorized to transition parcels to '${newStatus}'.`
      });
    }
  }

  next();
}

/**
 * Client-side / In-memory helper to check permissions
 */
function verifyLocalCredentials(token) {
  if (!token) return null;
  return AUTHORIZED_CREDENTIALS[token] || null;
}

module.exports = {
  AUTHORIZED_CREDENTIALS,
  isValidParcelCode,
  authenticateAgent,
  validateStatusUpdate,
  verifyLocalCredentials
};
