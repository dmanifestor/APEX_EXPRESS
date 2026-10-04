export interface AuthorizingUser {
  userId: string;
  name: string;
  role: 'dispatcher' | 'customs_officer' | 'supervisor' | 'courier_agent' | 'system';
  roleTitle: string;
  badge: string;
  station: string;
  department: string;
  keyUsed: string;
  email: string;
  avatarInitials: string;
}

export interface SecurityAuditMetadata {
  hash: string;
  terminalId: string;
  signatureVerified: boolean;
  ipAddress: string;
  protocol: string;
}

export interface AuditLogEntry {
  id: string;
  parcelId: string;
  timestamp: string;
  isoTimestamp: string;
  previousStatus: 'created' | 'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered';
  newStatus: 'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered';
  actionName: string;
  statusLabel: string;
  reason: string;
  location: string;
  authorizedBy: AuthorizingUser;
  securityAudit: SecurityAuditMetadata;
  notes?: string;
  severity?: 'normal' | 'alert' | 'critical' | 'success';
}

export const INITIAL_AUDIT_LOGS: Record<string, AuditLogEntry[]> = {
  DELI01474: [
    {
      id: 'AUD-DELI01474-001',
      parcelId: 'DELI01474',
      timestamp: 'Sep 21, 2026 · 14:15 CET',
      isoTimestamp: '2026-09-21T12:15:00.000Z',
      previousStatus: 'created',
      newStatus: 'in_transit',
      actionName: 'Initial Consignment Acceptance & Security Scan',
      statusLabel: 'Package Collected by Courier',
      location: 'Technik Logistics Depot, Frankfurt am Main, Germany',
      reason: 'Consignment received from consignor Technik Precision GmbH. Dimensional tare weight (4.85kg) verified.',
      authorizedBy: {
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
      },
      securityAudit: {
        hash: 'SHA256:7f4a9b2c3d1e8091a45f9208dcba716e9941a80c2f1e4d',
        terminalId: 'FRA-DEPOT-T01',
        signatureVerified: true,
        ipAddress: '194.25.0.42',
        protocol: 'APEX-TLSv1.3/AES-256',
      },
      notes: 'Waybill DELI01474 cryptographic barcode generated and attached to primary cargo carton.',
      severity: 'normal',
    },
    {
      id: 'AUD-DELI01474-002',
      parcelId: 'DELI01474',
      timestamp: 'Sep 21, 2026 · 21:40 CET',
      isoTimestamp: '2026-09-21T19:40:00.000Z',
      previousStatus: 'in_transit',
      newStatus: 'in_transit',
      actionName: 'Export Customs Inspection Clearance (FRA)',
      statusLabel: 'Export Customs Cleared',
      location: 'Frankfurt Cargo Gateway Hub (FRA-T4), Germany',
      reason: 'European export declaration inspected under ATLAS e-Customs protocol with zero tariff discrepancies.',
      authorizedBy: {
        userId: 'customs_fra_12',
        name: 'Officer Karl Brenner',
        role: 'customs_officer',
        roleTitle: 'Federal Customs Clearance Inspector',
        badge: 'FRA-CUST-12',
        station: 'Luftfracht-Zollamt Frankfurt am Main',
        department: 'German Federal Customs Administration (Bundeszollverwaltung)',
        keyUsed: 'EUR-CUST-AUTH-90',
        email: 'k.brenner@zoll.de',
        avatarInitials: 'KB',
      },
      securityAudit: {
        hash: 'SHA256:1a84f32e90c88b71d49257e10b42918841a0e883921e0b',
        terminalId: 'ZPO-FRA-08',
        signatureVerified: true,
        ipAddress: '194.25.12.8',
        protocol: 'EUR-CUSTOMS-EDI/v4',
      },
      notes: 'Export license verified. Parcel transferred directly to secure airside ramp consolidation bay.',
      severity: 'success',
    },
    {
      id: 'AUD-DELI01474-003',
      parcelId: 'DELI01474',
      timestamp: 'Sep 22, 2026 · 04:30 CET',
      isoTimestamp: '2026-09-22T02:30:00.000Z',
      previousStatus: 'in_transit',
      newStatus: 'in_transit',
      actionName: 'ULD Cargo Container Consolidation & Air Manifest Sign-off',
      statusLabel: 'Loaded onto Outbound Aircraft',
      location: 'Frankfurt Airport Airside Tarmac (Gate F-18), Germany',
      reason: 'Package secured inside temperature-controlled unit load device ULD-APX-9941B for Flight APX-9481.',
      authorizedBy: {
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
      },
      securityAudit: {
        hash: 'SHA256:9981bc09341de41a80cf190289a32c4819ef381a4b921c',
        terminalId: 'RAMP-902-MOBILE',
        signatureVerified: true,
        ipAddress: '10.240.18.99',
        protocol: 'IATA-CARGO-IMP/XML',
      },
      notes: 'Weight balance manifest approved by flight dispatcher. Flight Captain signed off on manifest APX-9481.',
      severity: 'normal',
    },
    {
      id: 'AUD-DELI01474-004',
      parcelId: 'DELI01474',
      timestamp: 'Sep 22, 2026 · 07:15 UTC',
      isoTimestamp: '2026-09-22T07:15:00.000Z',
      previousStatus: 'in_transit',
      newStatus: 'in_transit',
      actionName: 'Airspace Transponder Verification & In-Flight Telemetry',
      statusLabel: 'Package is on its way (In Air Transit)',
      location: 'Airspace Mediterranean Corridor (Flight APX-9481, FL380)',
      reason: 'Automatic transponder ping received. Cruise speed 485 knots, ambient temperature -48°C container regulated.',
      authorizedBy: {
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
      },
      securityAudit: {
        hash: 'SHA256:d813470912cb8491028471bce1084291884a1e9481a0e8',
        terminalId: 'ACARS-SATCOM-01',
        signatureVerified: true,
        ipAddress: '172.16.88.2',
        protocol: 'ARINC-429/ACARS',
      },
      notes: 'Flight estimated landing at Cairo Delivery Gateway Cargo Hub on schedule.',
      severity: 'success',
    },
  ],
  DELI08821: [
    {
      id: 'AUD-DELI08821-001',
      parcelId: 'DELI08821',
      timestamp: 'Sep 20, 2026 · 11:20 CET',
      isoTimestamp: '2026-09-20T09:20:00.000Z',
      previousStatus: 'created',
      newStatus: 'in_transit',
      actionName: 'Consignment Booking & Depot Acceptance',
      statusLabel: 'Picked Up by Rotterdam Depot',
      location: 'Rotterdam Central Intermodal Depot, Netherlands',
      reason: 'Freight accepted from Nordic Logistics BV. 2 cartons totaling 7.40kg commercial cargo.',
      authorizedBy: {
        userId: 'agent_nl_04',
        name: 'Lars van Dijk',
        role: 'dispatcher',
        roleTitle: 'Regional Freight Dispatcher',
        badge: 'RTM-DISP-04',
        station: 'Rotterdam Intermodal Port Hub',
        department: 'Apex Benelux Cargo Logistics',
        keyUsed: 'APEX-DISPATCH-990',
        email: 'l.vandijk@apex-logistics.nl',
        avatarInitials: 'LD',
      },
      securityAudit: {
        hash: 'SHA256:e01928bc941a80cf1928471bc0918841a0e883921e0b71',
        terminalId: 'RTM-DESK-02',
        signatureVerified: true,
        ipAddress: '145.220.10.15',
        protocol: 'APEX-TLSv1.3/AES-256',
      },
      severity: 'normal',
    },
    {
      id: 'AUD-DELI08821-002',
      parcelId: 'DELI08821',
      timestamp: 'Sep 21, 2026 · 18:30 UTC+2',
      isoTimestamp: '2026-09-21T16:30:00.000Z',
      previousStatus: 'in_transit',
      newStatus: 'in_transit',
      actionName: 'Inbound Cargo Landing & Bay Transfer',
      statusLabel: 'Arrived at Cairo International Cargo Terminal 2',
      location: 'Cairo International Airport (CAI), Egypt',
      reason: 'Offloaded from flight MS-782 at Terminal 2 Cargo Village. Dispatched to incoming optical scanner line.',
      authorizedBy: {
        userId: 'agent_cai_19',
        name: 'Amr Mostafa',
        role: 'dispatcher',
        roleTitle: 'Terminal Operations Ramp Supervisor',
        badge: 'CAI-RAMP-19',
        station: 'Cairo Cargo Village (Terminal 2)',
        department: 'Apex Middle East Air Operations',
        keyUsed: 'APEX-DISPATCH-990',
        email: 'a.mostafa@apex-logistics.eg',
        avatarInitials: 'AM',
      },
      securityAudit: {
        hash: 'SHA256:88192841028471bce10842918841a0e883921e0b941a80',
        terminalId: 'CAI-RAMP-T04',
        signatureVerified: true,
        ipAddress: '197.35.40.11',
        protocol: 'APEX-TLSv1.3/AES-256',
      },
      severity: 'normal',
    },
    {
      id: 'AUD-DELI08821-003',
      parcelId: 'DELI08821',
      timestamp: 'Sep 22, 2026 · 09:15 UTC+2',
      isoTimestamp: '2026-09-22T07:15:00.000Z',
      previousStatus: 'in_transit',
      newStatus: 'on_hold',
      actionName: 'Customs Quarantine Detention Notice (ECA-41 Issued)',
      statusLabel: 'Package is on hold in Egypt',
      location: 'Cairo International Airport Air Cargo Terminal 2, Customs Inspection Bay B-4, Egypt',
      reason: 'Declared commercial goods require statutory tariff evaluation and formal importer identification endorsement (Form ECA-41).',
      authorizedBy: {
        userId: 'customs_eg_77',
        name: 'Officer Tariq Al-Farouk',
        role: 'customs_officer',
        roleTitle: 'Senior Customs Clearance Officer',
        badge: 'ECA-771',
        station: 'Cairo Terminal 2 Air Cargo Directorate (CAI-T2)',
        department: 'Egyptian Customs Authority (ECA) - Ministry of Finance',
        keyUsed: 'EGY-CUST-AUTH-41',
        email: 'clearance-cairo@apex-logistics.eg',
        avatarInitials: 'TF',
      },
      securityAudit: {
        hash: 'SHA256:c941841a0e883921e0b88192841028471bce1084291884',
        terminalId: 'ECA-INSP-BAY-B4',
        signatureVerified: true,
        ipAddress: '197.35.22.4',
        protocol: 'ECA-GOV-GATEWAY/v2',
      },
      notes: 'Clearance fee assessment: EGP 1,450 (~$30.00 USD). Commercial invoice & Tax ID copy required for release.',
      severity: 'alert',
    },
  ],
};
