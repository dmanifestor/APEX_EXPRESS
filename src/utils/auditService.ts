import { AuditLogEntry, AuthorizingUser, INITIAL_AUDIT_LOGS } from '../data/auditLogs';

const STORAGE_KEY = 'apex_audit_logs';

export function getStoredAuditLogs(): Record<string, AuditLogEntry[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse audit logs from localStorage:', err);
  }
  return { ...INITIAL_AUDIT_LOGS };
}

export function saveStoredAuditLogs(data: Record<string, AuditLogEntry[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save audit logs to localStorage:', err);
  }
}

export function resolveAuthorizingOfficer(keyOrRole?: string, targetStatus?: string): AuthorizingUser {
  const cleanKey = (keyOrRole || '').trim().toUpperCase();

  if (cleanKey.includes('EGY') || cleanKey.includes('CUST') || targetStatus === 'on_hold') {
    return {
      userId: 'customs_eg_77',
      name: 'Officer Tariq Al-Farouk',
      role: 'customs_officer',
      roleTitle: 'Senior Customs Clearance Inspector',
      badge: 'ECA-771',
      station: 'Cairo Terminal 2 Air Cargo Directorate (CAI-T2)',
      department: 'Egyptian Customs Authority (ECA) - Ministry of Finance',
      keyUsed: 'EGY-CUST-AUTH-41',
      email: 'clearance-cairo@apex-logistics.eg',
      avatarInitials: 'TF',
    };
  }

  if (cleanKey.includes('DEMO') || cleanKey.includes('SUPERVISOR')) {
    return {
      userId: 'demo_supervisor',
      name: 'Logistics Operations Supervisor',
      role: 'supervisor',
      roleTitle: 'Global Air Network Operations Director',
      badge: 'GLOBAL-OPS-26',
      station: 'Apex Worldwide Network Operations Center (NOC)',
      department: 'Global Air Cargo Routing & Avionics',
      keyUsed: 'DEMO-KEY-2026',
      email: 'noc-supervisor@apex-logistics.aero',
      avatarInitials: 'LS',
    };
  }

  if (targetStatus === 'out_for_delivery') {
    return {
      userId: 'agent_cai_courier',
      name: 'Amira Hassan',
      role: 'courier_agent',
      roleTitle: 'Metro Cairo Express Courier Driver #42',
      badge: 'CAI-DRV-42',
      station: 'Apex Express Metro Depot (New Cairo Logistics Park)',
      department: 'Last-Mile Delivery & Client Operations',
      keyUsed: 'APEX-DISPATCH-990',
      email: 'a.hassan@apex-logistics.eg',
      avatarInitials: 'AH',
    };
  }

  if (targetStatus === 'delivered') {
    return {
      userId: 'agent_delivered',
      name: 'Hassan El-Sayed',
      role: 'courier_agent',
      roleTitle: 'Certified Cargo Delivery Sign-off Officer',
      badge: 'CAI-CERT-88',
      station: 'Apex Express Metro Depot (New Cairo Logistics Park)',
      department: 'Consignee Verification & Signature Audit',
      keyUsed: 'DEMO-KEY-2026',
      email: 'h.elsayed@apex-logistics.eg',
      avatarInitials: 'HE',
    };
  }

  // Default dispatcher
  return {
    userId: 'agent_01',
    name: 'Markus Vance',
    role: 'dispatcher',
    roleTitle: 'Senior Air Freight Dispatcher',
    badge: 'FRA-DISP-09',
    station: 'Frankfurt Central Hub (FRA-T4)',
    department: 'Apex Global Logistics Air Operations',
    keyUsed: 'APEX-DISPATCH-990',
    email: 'm.vance@apex-freight.de',
    avatarInitials: 'MV',
  };
}

/**
 * Fetches the full detailed activity/audit log for a parcel.
 * Simulates network fetch with fallbacks to localStorage.
 */
export async function fetchAuditLog(parcelId: string): Promise<AuditLogEntry[]> {
  const code = parcelId.trim().toUpperCase();

  // Try fetching from internal API endpoint first
  try {
    const res = await fetch(`/api/audit-logs?code=${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Network or mock offline fallback
  }

  // Fallback to localStorage or in-memory seeds
  const stored = getStoredAuditLogs();
  if (stored[code] && stored[code].length > 0) {
    return stored[code];
  }

  if (INITIAL_AUDIT_LOGS[code]) {
    return INITIAL_AUDIT_LOGS[code];
  }

  // Default synthetic entries for new or unrecognized parcel codes
  const defaultUser = resolveAuthorizingOfficer('APEX-DISPATCH-990', 'in_transit');
  const now = new Date();
  return [
    {
      id: `AUD-${code}-001`,
      parcelId: code,
      timestamp: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC`,
      isoTimestamp: now.toISOString(),
      previousStatus: 'created',
      newStatus: 'in_transit',
      actionName: 'Initial Consignment Waybill Booking',
      statusLabel: 'Package Registered in Apex Global Network',
      reason: `Consignment ${code} registered with verified manifest and authorized for global air freight transit.`,
      location: 'Apex International Gateway Dispatch',
      authorizedBy: defaultUser,
      securityAudit: {
        hash: `SHA256:${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
        terminalId: 'SYS-GLOBAL-01',
        signatureVerified: true,
        ipAddress: '192.168.1.100',
        protocol: 'APEX-TLSv1.3/AES-256',
      },
      severity: 'normal',
    },
  ];
}

/**
 * Appends a new status change event to the audit trail
 */
export async function addAuditLogEntry(
  parcelId: string,
  newStatus: 'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered',
  previousStatus: 'created' | 'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered',
  options?: {
    customOfficer?: AuthorizingUser;
    keyUsed?: string;
    reason?: string;
    location?: string;
  }
): Promise<AuditLogEntry> {
  const code = parcelId.trim().toUpperCase();
  const allLogs = getStoredAuditLogs();
  const existing = allLogs[code] || INITIAL_AUDIT_LOGS[code] || [];

  const officer = options?.customOfficer || resolveAuthorizingOfficer(options?.keyUsed, newStatus);
  const now = new Date();
  const formattedTime = `${now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} · ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC`;

  let actionName = 'Status Updated';
  let statusLabel = 'Package status updated';
  let defaultReason = 'Routine logistics transit transition authorized.';
  let severity: 'normal' | 'alert' | 'critical' | 'success' = 'normal';

  if (newStatus === 'in_transit') {
    actionName = previousStatus === 'on_hold' ? 'Customs Hold Lifted & Transit Resumed' : 'Air Cargo Transit Dispatch';
    statusLabel = 'Package is on its way';
    defaultReason = previousStatus === 'on_hold'
      ? 'Customs clearance approved by officer. Consignment released from Cairo Terminal 2.'
      : 'In flight aboard freight carrier APX-9481 towards Cairo Delivery Gateway.';
    severity = 'success';
  } else if (newStatus === 'on_hold') {
    actionName = 'Egyptian Customs Authority Detention Notice (ECA-41)';
    statusLabel = 'Package is on hold in Egypt';
    defaultReason = 'Mandatory tariff verification, commercial invoice review, and importer Form ECA-41 endorsement required.';
    severity = 'alert';
  } else if (newStatus === 'out_for_delivery') {
    actionName = 'Outbound Dispatch to Metro Courier Van';
    statusLabel = 'Out for Delivery';
    defaultReason = 'Package cleared regional hub and transferred to courier driver for final destination delivery.';
    severity = 'normal';
  } else if (newStatus === 'delivered') {
    actionName = 'Consignee Delivery & Biometric Signature Verification';
    statusLabel = 'Package Delivered & Signed';
    defaultReason = 'Consignment handed over to recipient Joel Dan. Waybill receipt signed with identity confirmation.';
    severity = 'success';
  }

  const newEntry: AuditLogEntry = {
    id: `AUD-${code}-${String(existing.length + 1).padStart(3, '0')}`,
    parcelId: code,
    timestamp: formattedTime,
    isoTimestamp: now.toISOString(),
    previousStatus,
    newStatus,
    actionName,
    statusLabel,
    reason: options?.reason || defaultReason,
    location: options?.location || officer.station,
    authorizedBy: officer,
    securityAudit: {
      hash: `SHA256:${Array.from({ length: 4 }, () => Math.random().toString(16).substring(2, 10)).join('')}`,
      terminalId: `TERM-${officer.badge.replace(/[^A-Z0-9]/g, '')}-01`,
      signatureVerified: true,
      ipAddress: '197.35.41.' + (10 + existing.length),
      protocol: 'APEX-AUDIT-v2/SECURE',
    },
    notes: `Authorization token: ${officer.keyUsed} validated through Apex Central Identity Gateway.`,
    severity,
  };

  const updatedList = [newEntry, ...existing];
  allLogs[code] = updatedList;
  saveStoredAuditLogs(allLogs);

  // Attempt POST to backend endpoint if active
  try {
    await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });
  } catch {
    // offline / client-only fallback
  }

  return newEntry;
}
