/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Plane,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  FileText,
  Printer,
  Share2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  Phone,
  Mail,
  User,
  Check,
  UploadCloud,
  X,
  LogOut,
  ShieldCheck,
  Play,
  Pause
} from 'lucide-react';
import { FullActivityLog } from './components/FullActivityLog';
import { addAuditLogEntry } from './utils/auditService';

interface Stage {
  title: string;
  completed: boolean;
  current?: boolean;
  isHold?: boolean;
  timestamp: string;
}

interface TimelineEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  detail: string;
  badge: string;
}

interface ParcelData {
  parcel_id: string;
  tracking_code: string;
  service_type: string;
  status: 'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered';
  status_label: string;
  status_detail: string;
  origin: {
    city: string;
    country: string;
    facility: string;
  };
  destination: {
    city: string;
    country: string;
    address: string;
    recipient: string;
  };
  sender: {
    name: string;
    city: string;
    country: string;
  };
  specs: {
    weight: string;
    dimensions: string;
    pieces: number;
    declared_value: string;
    service_class: string;
    signature_required: boolean;
    insurance: string;
  };
  estimated_delivery: {
    date: string;
    time_window: string;
  };
  stages: Stage[];
  timeline: TimelineEvent[];
  hold_info?: {
    location: string;
    hold_code: string;
    authority: string;
    reason: string;
    hold_timestamp: string;
    contact_officer: string;
    contact_phone: string;
    contact_email: string;
    clearance_fee: string;
  };
}

const INITIAL_PARCELS: Record<string, ParcelData> = {
  DELI01474: {
    parcel_id: 'DELI01474',
    tracking_code: 'DELI01474',
    service_type: 'Apex Priority Global Air Express',
    status: 'in_transit',
    status_label: 'Package is on its way',
    status_detail:
      'Your parcel is traveling via international air freight aboard flight APX-9481 from Frankfurt Hub to Cairo Delivery Gateway. Customs export inspection cleared with zero exceptions.',
    origin: {
      city: 'Frankfurt',
      country: 'Germany',
      facility: 'Frankfurt Cargo Gateway Hub (FRA-T4)',
    },
    destination: {
      city: 'Cairo',
      country: 'Egypt',
      address: 'Apex Express Metro Depot, New Cairo Logistics Park',
      recipient: 'Joel Dan (Apex Priority Recipient)',
    },
    sender: {
      name: 'Technik Precision GmbH',
      city: 'Frankfurt am Main',
      country: 'Germany',
    },
    specs: {
      weight: '4.85 kg (10.69 lbs)',
      dimensions: '34 × 22 × 15 cm',
      pieces: 1,
      declared_value: '$1,250.00 USD',
      service_class: 'Tier-1 Express Air Courier',
      signature_required: true,
      insurance: 'Full Transit Cargo Protection',
    },
    estimated_delivery: {
      date: 'September 26, 2026',
      time_window: '14:00 - 18:30 (Local Time)',
    },
    stages: [
      { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
      { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
      { title: 'In International Transit', current: true, completed: false, timestamp: 'Sept 22, 07:15 UTC' },
      { title: 'Import Customs', completed: false, timestamp: 'Estimated Sept 24' },
      { title: 'Final Delivery', completed: false, timestamp: 'Estimated Sept 26' },
    ],
    timeline: [
      {
        date: 'Sep 22, 2026',
        time: '07:15 UTC',
        location: 'Airspace Mediterranean Corridor - Flight APX-9481',
        status: 'In Air Transit - Package is on its way',
        detail:
          'Aircraft cruising altitude FL380. Package secured in container ULD-APX-9941B. Transponder telemetry verified on schedule.',
        badge: 'Active',
      },
      {
        date: 'Sep 22, 2026',
        time: '04:30 CET',
        location: 'Frankfurt Airport (FRA), Germany',
        status: 'Loaded onto Outbound Aircraft',
        detail: 'Pallet consolidated and scanned into air manifest APX-9481 by Ground Cargo Ops.',
        badge: 'Completed',
      },
      {
        date: 'Sep 21, 2026',
        time: '21:40 CET',
        location: 'Frankfurt Cargo Gateway, Germany',
        status: 'Export Customs Cleared',
        detail: 'Export clearance inspection completed and approved by Officer FRA-CUST-12.',
        badge: 'Completed',
      },
      {
        date: 'Sep 21, 2026',
        time: '14:15 CET',
        location: 'Technik Logistics Depot, Frankfurt, Germany',
        status: 'Collected by Apex Courier',
        detail: 'Consignment collected from sender; tracking number DELI01474 registered in global system.',
        badge: 'Completed',
      },
    ],
  },
  DELI08821: {
    parcel_id: 'DELI08821',
    tracking_code: 'DELI08821',
    service_type: 'Apex Global Express Freight',
    status: 'on_hold',
    status_label: 'Package is on hold in Egypt',
    status_detail:
      'Shipment is temporarily held at Cairo International Cargo Terminal 2 under Egyptian Customs Authority detention protocol ECA-41 pending commercial duty assessment.',
    origin: {
      city: 'Rotterdam',
      country: 'Netherlands',
      facility: 'Rotterdam North Intermodal Port',
    },
    destination: {
      city: 'Cairo',
      country: 'Egypt',
      address: 'Apex Consignee Station, Heliopolis, Cairo',
      recipient: 'Joel Dan / Priority Consignee',
    },
    sender: {
      name: 'Nordic Logistics BV',
      city: 'Rotterdam',
      country: 'Netherlands',
    },
    specs: {
      weight: '7.40 kg (16.31 lbs)',
      dimensions: '48 × 30 × 24 cm',
      pieces: 2,
      declared_value: '$2,400.00 USD',
      service_class: 'Heavy Commercial Express Freight',
      signature_required: true,
      insurance: 'Secured Freight Transit Tier-2',
    },
    estimated_delivery: {
      date: 'Pending Customs Release',
      time_window: 'Upon Form ECA-41 Clearance',
    },
    hold_info: {
      location: 'Cairo International Airport Air Cargo Terminal 2, Inspection Bay B-4, Cairo, Egypt',
      hold_code: 'EGY-GOV-CUST-883',
      authority: 'Egyptian Customs Authority (ECA) - Air Cargo Import Directorate',
      reason:
        'Detained for formal commercial tariff classification and importer identification validation (Form ECA-41).',
      hold_timestamp: 'Sep 22, 2026 · 09:15 UTC+2',
      contact_officer: 'Officer Tariq Al-Farouk (Badge #ECA-771)',
      contact_phone: '+20 2 2265 0000 (Ext 4120)',
      contact_email: 'clearance-cairo@apex-logistics.eg',
      clearance_fee: 'EGP 1,450 (~$30.00 USD)',
    },
    stages: [
      { title: 'Picked Up', completed: true, timestamp: 'Sept 20, 11:20 CET' },
      { title: 'Departed Hub', completed: true, timestamp: 'Sept 21, 02:45 CET' },
      { title: 'Held at Customs in Egypt', current: true, isHold: true, completed: false, timestamp: 'Sept 22, 09:15 UTC+2' },
      { title: 'Clearance Release', completed: false, timestamp: 'Pending Consignee Action' },
      { title: 'Delivered', completed: false, timestamp: 'Awaiting Release' },
    ],
    timeline: [
      {
        date: 'Sep 22, 2026',
        time: '09:15 UTC+2',
        location: 'Cairo International Airport (CAI), Egypt',
        status: 'Held by Egyptian Customs Authority',
        detail:
          'Package flagged during incoming optical scanner inspection. Notice issued: Mandatory import valuation review required (Code EGY-GOV-CUST-883).',
        badge: 'On Hold',
      },
      {
        date: 'Sep 21, 2026',
        time: '18:30 UTC+2',
        location: 'Cairo International Airport (CAI), Egypt',
        status: 'Arrived at Cairo Inbound Hub',
        detail: 'Unloaded from flight MS-782 at Terminal 2 Cargo Village. Routed to bonded inspection zone.',
        badge: 'Arrived',
      },
      {
        date: 'Sep 21, 2026',
        time: '02:45 CET',
        location: 'Schiphol Cargo Airport, Amsterdam',
        status: 'Departed International Gateway',
        detail: 'Dispatched via scheduled cargo flight to Cairo International Airport.',
        badge: 'Completed',
      },
    ],
  },
  EGYP99402: {
    parcel_id: 'EGYP99402',
    tracking_code: 'EGYP99402',
    service_type: 'Apex Priority Cargo Transit',
    status: 'on_hold',
    status_label: 'Package is on hold in Egypt',
    status_detail:
      'Shipment is held at Cairo Airport Customs Village pending consignee identity verification and payment of administrative import clearance stamp.',
    origin: {
      city: 'London',
      country: 'UK',
      facility: 'Heathrow Cargo Center (LHR)',
    },
    destination: {
      city: 'Cairo',
      country: 'Egypt',
      address: 'Apex Consignee Station, Zamalek, Cairo',
      recipient: 'Joel Dan / Regional Delivery',
    },
    sender: {
      name: 'Thames Industrial Supply',
      city: 'London',
      country: 'UK',
    },
    specs: {
      weight: '3.20 kg',
      dimensions: '28 × 18 × 12 cm',
      pieces: 1,
      declared_value: '$890.00 USD',
      service_class: 'Express Priority Cargo',
      signature_required: true,
      insurance: 'Standard Cargo Protection',
    },
    estimated_delivery: {
      date: 'Pending Clearance Release',
      time_window: 'Upon Customs Release Protocol',
    },
    hold_info: {
      location: 'Cairo International Airport Air Cargo Terminal 2, Customs Inspection Bay B-4, Cairo, Egypt',
      hold_code: 'EGY-GOV-CUST-883',
      authority: 'Egyptian Customs Authority (ECA)',
      reason: 'Held for statutory import tariff verification and Form ECA-41 endorsement.',
      hold_timestamp: 'Sep 22, 2026 · 09:15 UTC+2',
      contact_officer: 'Officer Tariq Al-Farouk (Badge #ECA-771)',
      contact_phone: '+20 2 2265 0000 (Ext 4120)',
      contact_email: 'clearance-cairo@apex-logistics.eg',
      clearance_fee: 'EGP 1,450 (~$30.00 USD)',
    },
    stages: [
      { title: 'Picked Up', completed: true, timestamp: 'Sept 20' },
      { title: 'Departed London', completed: true, timestamp: 'Sept 21' },
      { title: 'Held at Customs in Egypt', current: true, isHold: true, completed: false, timestamp: 'Sept 22' },
      { title: 'Clearance Release', completed: false, timestamp: 'Pending Action' },
      { title: 'Delivered', completed: false, timestamp: 'Awaiting Release' },
    ],
    timeline: [
      {
        date: 'Sep 22, 2026',
        time: '09:15 UTC+2',
        location: 'Cairo International Airport (CAI), Egypt',
        status: 'Held by Egyptian Customs Authority',
        detail: 'Consignment flagged for duty assessment under code EGY-GOV-CUST-883.',
        badge: 'On Hold',
      },
    ],
  },
};

export default function App() {
  const [parcels, setParcels] = useState<Record<string, ParcelData>>(() => {
    try {
      const stored = localStorage.getItem('apex_parcels_db');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_PARCELS;
  });

  const [inputCode, setInputCode] = useState('');
  const [activeCode, setActiveCode] = useState('DELI01474');
  const [activeTab, setActiveTab] = useState<'track' | 'result' | 'on_hold' | 'dispatcher' | 'logout'>('track');
  const [notification, setNotification] = useState<string | null>(null);

  // Dispatcher controls state
  const [dispatcherPin, setDispatcherPin] = useState('APEX-DISPATCH-990');
  const [targetParcelSelect, setTargetParcelSelect] = useState('DELI01474');
  const [newStatusSelect, setNewStatusSelect] = useState<'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered'>('in_transit');
  const [statusLog, setStatusLog] = useState('');

  // Customs clearance upload modal
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docsSubmitted, setDocsSubmitted] = useState(false);

  // Helper to change route via clean hash (#track, #result, #logout, #dispatcher)
  const navigateTo = (tab: 'track' | 'result' | 'on_hold' | 'dispatcher' | 'logout', code?: string) => {
    const targetCode = (code || activeCode || 'DELI01474').toUpperCase();
    if (code) {
      setActiveCode(targetCode);
    }
    setActiveTab(tab);
    if (tab === 'track') {
      window.location.hash = 'track';
    } else if (tab === 'result') {
      window.location.hash = targetCode ? `result?code=${targetCode}` : 'result';
    } else if (tab === 'on_hold') {
      window.location.hash = targetCode ? `result?code=${targetCode}` : 'result';
    } else if (tab === 'dispatcher') {
      window.location.hash = 'dispatcher';
    } else if (tab === 'logout') {
      window.location.hash = 'logout';
    }
  };

  // Sync state with window.location.hash on mount and when hash changes
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash || '';
      
      // Default to /#track when hash is empty or explicitly #track / #/track
      if (!hash || hash === '#' || hash === '#/' || hash === '#track' || hash === '#/track') {
        setActiveTab('track');
        if (window.location.hash !== '#track') {
          window.location.hash = 'track';
        }
        return;
      }

      // Supports formats: #track, #/track, #result, #result?code=..., #logout, #dispatcher, #DELI01474
      const cleanHash = hash.replace(/^[#/]+/, '');
      const [pathPart, queryPart] = cleanHash.split('?');
      const params = new URLSearchParams(queryPart || '');
      const codeFromQuery = params.get('code');

      if (pathPart === 'track') {
        setActiveTab('track');
      } else if (pathPart === 'dispatcher') {
        setActiveTab('dispatcher');
      } else if (pathPart === 'logout') {
        setActiveTab('logout');
      } else if (pathPart.startsWith('result')) {
        const pathCode = pathPart.includes('/') ? pathPart.split('/')[1] : null;
        const code = (codeFromQuery || pathCode || activeCode || 'DELI01474').toUpperCase();
        setActiveCode(code);
        setActiveTab('result');
      } else if (pathPart.startsWith('on-hold') || pathPart.startsWith('on_hold')) {
        const pathCode = pathPart.includes('/') ? pathPart.split('/')[1] : null;
        const code = (codeFromQuery || pathCode || activeCode || 'DELI08821').toUpperCase();
        setActiveCode(code);
        setActiveTab('on_hold');
      } else {
        // Direct tracking code in hash e.g. /#DELI01474
        const directCode = pathPart.toUpperCase();
        if (parcels[directCode]) {
          setActiveCode(directCode);
          if (parcels[directCode].status === 'on_hold') {
            setActiveTab('on_hold');
          } else {
            setActiveTab('result');
          }
        }
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, [parcels]);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('apex_parcels_db', JSON.stringify(parcels));
    } catch {
      // ignore
    }
  }, [parcels]);

  // Current selected parcel
  const currentParcel = parcels[activeCode] || parcels['DELI01474'];

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTrackSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputCode.trim().toUpperCase();

    if (!clean) {
      showToast('ENTER PARCEL CODE: Please enter a valid parcel tracking code.');
      return;
    }

    if (clean === 'DELI01474') {
      const p = parcels['DELI01474'];
      if (p && p.status === 'on_hold') {
        navigateTo('on_hold', 'DELI01474');
      } else {
        navigateTo('result', 'DELI01474');
      }
      return;
    }

    if (parcels[clean]) {
      if (parcels[clean].status === 'on_hold') {
        navigateTo('on_hold', clean);
      } else {
        navigateTo('result', clean);
      }
      return;
    }

    if (clean.includes('HOLD') || clean.includes('EGY') || clean === 'DELI08821' || clean === 'EGYP99402') {
      navigateTo('on_hold', clean);
      return;
    }

    // When parcel code is entered correctly, create entry and immediately load to the result page
    const base = parcels['DELI01474'] || INITIAL_PARCELS['DELI01474'];
    const customParcel: ParcelData = {
      ...base,
      parcel_id: clean,
      tracking_code: clean,
      status: 'in_transit',
      status_label: 'Package is on its way',
      status_detail: `Consignment ${clean} is traveling via Apex Priority Global Air Express aboard flight APX-9481 from Frankfurt Hub to Cairo Delivery Gateway. Customs export inspection cleared with zero exceptions.`,
    };

    setParcels((prev) => ({
      ...prev,
      [clean]: customParcel,
    }));
    navigateTo('result', clean);
  };

  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [auditRefreshTrigger, setAuditRefreshTrigger] = useState(0);

  const changeParcelStatus = (
    code: string,
    newStatus: 'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered',
    notify: boolean = true,
    keyUsed?: string,
    customRemarks?: string
  ) => {
    const prevStatus = parcels[code]?.status || 'in_transit';
    addAuditLogEntry(code, newStatus, prevStatus, {
      keyUsed: keyUsed || (newStatus === 'on_hold' ? 'EGY-CUST-AUTH-41' : 'APEX-DISPATCH-990'),
      reason: customRemarks,
    }).then(() => {
      setAuditRefreshTrigger((prev) => prev + 1);
    });

    setParcels((prev) => {
      const target = prev[code] || prev['DELI01474'];
      if (!target) return prev;

      let label = target.status_label;
      let detail = target.status_detail;
      let updatedStages: Stage[] = [];

      if (newStatus === 'in_transit') {
        label = 'Package is on its way';
        detail =
          'Your parcel is traveling via international air freight aboard flight APX-9481 from Frankfurt Hub to Cairo Delivery Gateway. Customs export inspection cleared with zero exceptions.';
        updatedStages = [
          { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
          { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
          { title: 'In Air Transit', current: true, completed: false, isHold: false, timestamp: 'Sept 22, 07:15 UTC' },
          { title: 'Import Clearance', completed: false, timestamp: 'Estimated Sept 24' },
          { title: 'Final Delivery', completed: false, timestamp: 'Estimated Sept 26' },
        ];
      } else if (newStatus === 'on_hold') {
        label = 'Package is on hold in Egypt';
        detail =
          'Shipment is temporarily held at Cairo International Cargo Terminal 2 under Egyptian Customs Authority detention protocol ECA-41 pending commercial duty assessment.';
        updatedStages = [
          { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
          { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
          { title: 'Customs Hold (Egypt)', current: true, completed: false, isHold: true, timestamp: 'Sept 22, 09:15 UTC+2' },
          { title: 'Clearance Release', completed: false, timestamp: 'Pending Consignee Action' },
          { title: 'Final Delivery', completed: false, timestamp: 'Awaiting Release' },
        ];
      } else if (newStatus === 'out_for_delivery') {
        label = 'Out for Delivery';
        detail =
          'Customs cleared. Parcel has arrived at Cairo Delivery Gateway Depot and is aboard Apex Courier Van #42 en route to the recipient address.';
        updatedStages = [
          { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
          { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
          { title: 'Air Transit Cleared', completed: true, timestamp: 'Sept 22, 16:30 UTC' },
          { title: 'Import Clearance', completed: true, timestamp: 'Sept 23, 08:15 UTC+2' },
          { title: 'Out for Final Delivery', current: true, completed: false, timestamp: 'Today, 10:45 UTC+2' },
        ];
      } else if (newStatus === 'delivered') {
        label = 'Delivered & Signed';
        detail =
          'Consignment DELI01474 successfully delivered to Joel Dan at Apex Express Metro Depot, New Cairo Logistics Park. Official delivery receipt signed with biometric verification.';
        updatedStages = [
          { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
          { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
          { title: 'Air Transit Cleared', completed: true, timestamp: 'Sept 22, 16:30 UTC' },
          { title: 'Import Clearance', completed: true, timestamp: 'Sept 23, 08:15 UTC+2' },
          { title: 'Delivered & Signed', completed: true, current: false, timestamp: 'Today, 14:20 UTC+2' },
        ];
      }

      const updated = {
        ...target,
        status: newStatus,
        status_label: label,
        status_detail: detail,
        stages: updatedStages,
        hold_info: newStatus === 'on_hold' ? (target.hold_info || {
          location: 'Cairo International Airport Air Cargo Terminal 2, Inspection Bay B-4, Cairo, Egypt',
          hold_code: 'EGY-GOV-CUST-883',
          authority: 'Egyptian Customs Authority (ECA)',
          reason: 'Held for statutory import tariff verification and Form ECA-41 endorsement.',
          hold_timestamp: 'Sep 22, 2026 · 09:15 UTC+2',
          contact_officer: 'Officer Tariq Al-Farouk (Badge #ECA-771)',
          contact_phone: '+20 2 2265 0000 (Ext 4120)',
          contact_email: 'clearance-cairo@apex-logistics.eg',
          clearance_fee: 'EGP 1,450 (~$30.00 USD)',
        }) : target.hold_info
      };

      return {
        ...prev,
        [code]: updated,
      };
    });

    if (notify) {
      showToast(`Status updated: ${code} is now '${newStatus.replace('_', ' ')}'. Stepper transitioned.`);
    }
  };

  // Auto-simulation effect for cycling statuses to demonstrate smooth stepper transitions
  useEffect(() => {
    if (!isAutoSimulating) return;

    const sequence: ('in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered')[] = [
      'in_transit',
      'on_hold',
      'out_for_delivery',
      'delivered',
    ];

    const timer = setInterval(() => {
      setParcels((prev) => {
        const cur = prev[activeCode] || prev['DELI01474'];
        if (!cur) return prev;
        const curIndex = sequence.indexOf(cur.status);
        const nextStatus = sequence[(curIndex + 1) % sequence.length];
        
        // Asynchronously log audit trail entry with authorized officer credentials
        addAuditLogEntry(activeCode, nextStatus, cur.status, {
          keyUsed: nextStatus === 'on_hold' ? 'EGY-CUST-AUTH-41' : 'APEX-DISPATCH-990',
        }).then(() => {
          setAuditRefreshTrigger((t) => t + 1);
        });

        let label = cur.status_label;
        let detail = cur.status_detail;
        let updatedStages: Stage[] = [];

        if (nextStatus === 'in_transit') {
          label = 'Package is on its way';
          detail = 'Your parcel is traveling via international air freight aboard flight APX-9481 from Frankfurt Hub to Cairo Delivery Gateway. Customs export inspection cleared with zero exceptions.';
          updatedStages = [
            { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
            { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
            { title: 'In Air Transit', current: true, completed: false, isHold: false, timestamp: 'Sept 22, 07:15 UTC' },
            { title: 'Import Clearance', completed: false, timestamp: 'Estimated Sept 24' },
            { title: 'Final Delivery', completed: false, timestamp: 'Estimated Sept 26' },
          ];
        } else if (nextStatus === 'on_hold') {
          label = 'Package is on hold in Egypt';
          detail = 'Shipment is temporarily held at Cairo International Cargo Terminal 2 under Egyptian Customs Authority detention protocol ECA-41 pending commercial duty assessment.';
          updatedStages = [
            { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
            { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
            { title: 'Customs Hold (Egypt)', current: true, completed: false, isHold: true, timestamp: 'Sept 22, 09:15 UTC+2' },
            { title: 'Clearance Release', completed: false, timestamp: 'Pending Consignee Action' },
            { title: 'Final Delivery', completed: false, timestamp: 'Awaiting Release' },
          ];
        } else if (nextStatus === 'out_for_delivery') {
          label = 'Out for Delivery';
          detail = 'Customs cleared. Parcel has arrived at Cairo Delivery Gateway Depot and is aboard Apex Courier Van #42 en route to the recipient address.';
          updatedStages = [
            { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
            { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
            { title: 'Air Transit Cleared', completed: true, timestamp: 'Sept 22, 16:30 UTC' },
            { title: 'Import Clearance', completed: true, timestamp: 'Sept 23, 08:15 UTC+2' },
            { title: 'Out for Final Delivery', current: true, completed: false, timestamp: 'Today, 10:45 UTC+2' },
          ];
        } else {
          label = 'Delivered & Signed';
          detail = 'Consignment DELI01474 successfully delivered to Joel Dan at Apex Express Metro Depot, New Cairo Logistics Park. Official delivery receipt signed with biometric verification.';
          updatedStages = [
            { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
            { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
            { title: 'Air Transit Cleared', completed: true, timestamp: 'Sept 22, 16:30 UTC' },
            { title: 'Import Clearance', completed: true, timestamp: 'Sept 23, 08:15 UTC+2' },
            { title: 'Delivered & Signed', completed: true, current: false, timestamp: 'Today, 14:20 UTC+2' },
          ];
        }

        return {
          ...prev,
          [activeCode]: {
            ...cur,
            status: nextStatus,
            status_label: label,
            status_detail: detail,
            stages: updatedStages,
          },
        };
      });
    }, 2400);

    return () => clearInterval(timer);
  }, [isAutoSimulating, activeCode]);

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const validPins = ['APEX-DISPATCH-990', 'EGY-CUST-AUTH-41', 'DEMO-KEY-2026'];

    if (!validPins.includes(dispatcherPin.trim())) {
      showToast('Authentication Error: Invalid Dispatcher PIN or Customs Key.');
      return;
    }

    changeParcelStatus(targetParcelSelect, newStatusSelect, false, dispatcherPin);
    showToast(`Status updated: ${targetParcelSelect} is now '${newStatusSelect.replace('_', ' ')}'. Stepper transitioned.`);
    setStatusLog(`Updated ${targetParcelSelect} to ${newStatusSelect} at ${new Date().toLocaleTimeString()}`);

    // Auto-route active view to the updated status via hash
    if (activeCode === targetParcelSelect) {
      if (newStatusSelect === 'on_hold') {
        navigateTo('on_hold', targetParcelSelect);
      } else {
        navigateTo('result', targetParcelSelect);
      }
    }
  };

  const releaseEgyptHold = () => {
    const updated = { ...parcels };
    const p = updated[activeCode] || updated['DELI08821'];
    if (p) {
      p.status = 'in_transit';
      p.status_label = 'Package is on its way';
      p.status_detail =
        'Customs clearance approved by Officer Tariq Al-Farouk. Package released from Cairo Cargo Terminal 2 and is on its way to final destination.';
      p.stages[2].isHold = false;
      p.stages[2].completed = true;
      p.stages[3].completed = true;
      p.stages[3].timestamp = 'Released Today';
      p.estimated_delivery.date = 'Tomorrow, September 23, 2026';
      setParcels(updated);
      setShowDocsModal(false);
      setDocsSubmitted(false);

      // Record in audit log
      addAuditLogEntry(p.tracking_code, 'in_transit', 'on_hold', {
        keyUsed: 'EGY-CUST-AUTH-41',
        reason: 'Customs quarantine detention released. Form ECA-41 verified and clearance fee receipt confirmed by Officer Tariq Al-Farouk.',
      }).then(() => {
        setAuditRefreshTrigger((prev) => prev + 1);
      });

      showToast(`Customs hold lifted! Consignment ${p.tracking_code} is now on its way.`);
      navigateTo('result', p.tracking_code);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-white flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-[#16181b] border-2 border-orange-500 text-white px-4 py-3 rounded-sm shadow-2xl flex items-center gap-3 text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar Contract (1 row, 3 zones) */}
      <header className="w-full bg-[#111214] border-b border-[#23272b] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Zone 1: Single text wordmark */}
          <div
            onClick={() => setActiveTab('track')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-sm flex items-center justify-center font-black text-black text-lg">
              ▲
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white uppercase group-hover:text-orange-400 transition-colors">
                APEX<span className="text-orange-500">EXPRESS</span>
              </span>
              <span className="text-[10px] tracking-widest text-zinc-400 uppercase -mt-1 font-mono">
                GLOBAL COURIER & FREIGHT
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
            <button
              onClick={() => navigateTo('track')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeTab === 'track' ? 'text-orange-400 font-semibold' : ''
              }`}
            >
              Consignment Search
            </button>
            <button
              onClick={() => navigateTo('result')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeTab === 'result' ? 'text-orange-400 font-semibold' : ''
              }`}
            >
              Result View
            </button>
            <button
              onClick={() => navigateTo('dispatcher')}
              className={`hover:text-white transition-colors cursor-pointer ${
                activeTab === 'dispatcher' ? 'text-orange-400 font-semibold' : ''
              }`}
            >
              Dispatcher Terminal
            </button>
          </nav>

          {/* Zone 3: Primary Action - LOGIN on track view, LOGOUT on other views */}
          <div className="flex items-center gap-3">
            {activeTab === 'track' ? (
              <button
                onClick={() => navigateTo('dispatcher')}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>LOGIN</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  showToast('Logged out. Returning to track.html...');
                  try {
                    sessionStorage.removeItem('apex_auth_session');
                    sessionStorage.removeItem('apex_dispatcher_pin');
                    sessionStorage.removeItem('apex_temp_code');
                  } catch {}
                  window.location.href = 'track.html';
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Switcher */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: SEARCH / TRACK CONSIGNMENT VIEW */}
        {activeTab === 'track' && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto pt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-950/60 border border-orange-800/60 rounded-full text-orange-400 text-xs font-medium uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                APEXEXPRESS Worldwide Logistics Gateway
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">
                Track Your <span className="text-orange-500">Package</span>
              </h1>
              <p className="mt-3 text-zinc-400 text-sm sm:text-base">
                Input your consignment ID to view live mock transit routing, flight telemetry, or customs clearance retention notices.
              </p>
            </div>

            {/* Tracking Search Form */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#141618] border-2 border-orange-500/70 p-4 sm:p-5 rounded-sm shadow-2xl shadow-black">
                <form onSubmit={handleTrackSubmit} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="parcel-input" className="block text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">
                      ENTER PARCEL CODE
                    </label>
                    <span className="text-[11px] font-mono text-zinc-500">Live Global Registry</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <Search className="w-5 h-5 text-orange-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        id="parcel-input"
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="ENTER PARCEL CODE"
                        className="w-full pl-12 pr-4 py-4 bg-[#0a0b0d] border border-[#2b3036] rounded-sm text-white placeholder-zinc-500 font-mono text-lg font-bold tracking-wider focus:outline-none focus:border-orange-500 uppercase"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-black font-extrabold uppercase tracking-wider text-sm rounded-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-orange-500/30"
                    >
                      <span>Track Parcel</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6">
              <div className="bg-[#141618] border border-[#23272b] p-6 rounded-sm border-l-4 border-l-orange-500">
                <Plane className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-base font-bold text-white uppercase tracking-wide mb-2">
                  Air Cargo Fleet Transit
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time simulated telemetry for high-priority parcels with transponder altitudes, flight numbers (APX-9481), and container ULD numbers.
                </p>
              </div>

              <div className="bg-[#141618] border border-[#23272b] p-6 rounded-sm border-l-4 border-l-amber-500">
                <ShieldAlert className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-base font-bold text-white uppercase tracking-wide mb-2">
                  Cairo Port Customs Protocol
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Specialized detention notice handling for packages held in Egypt (CAI Terminal 2) with consignee document submission and clearance resolution.
                </p>
              </div>

              <div className="bg-[#141618] border border-[#23272b] p-6 rounded-sm border-l-4 border-l-white">
                <FileText className="w-8 h-8 text-white mb-4" />
                <h3 className="text-base font-bold text-white uppercase tracking-wide mb-2">
                  Verified Waybill & Specs
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every parcel includes full dimensional specs, piece count, declared value in USD, verified shipper and recipient information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: RESULT VIEW (PACKAGE IS ON ITS WAY) */}
        {activeTab === 'result' && (
          <div className="space-y-8">
            {/* Breadcrumb Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab('track')} className="hover:text-white underline cursor-pointer">
                  Apex Tracking Hub
                </button>
                <span>/</span>
                <span>Air Freight Manifest</span>
                <span>/</span>
                <span className="text-white font-mono font-semibold">{currentParcel.tracking_code}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-zinc-300">Carrier Radar: Flight APX-9481 In Motion</span>
              </div>
            </div>

            {/* Master Result Banner */}
            <section className="bg-[#141618] border border-[#23272b] rounded-sm p-6 sm:p-8 border-l-4 border-l-orange-500 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2 font-mono">
                    <span className="text-orange-400 font-bold tracking-wider">
                      CONSIGNMENT # {currentParcel.tracking_code}
                    </span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{currentParcel.service_type}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="text-emerald-400 font-semibold">Priority Air Cargo</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase flex flex-wrap items-center gap-3">
                    <span>{currentParcel.status_label}</span>
                    <span className={`inline-flex items-center px-3 py-1 text-black text-xs font-black rounded-sm uppercase tracking-wider transition-colors duration-500 ${
                      currentParcel.status === 'on_hold'
                        ? 'bg-amber-500'
                        : currentParcel.status === 'delivered'
                        ? 'bg-emerald-400'
                        : currentParcel.status === 'out_for_delivery'
                        ? 'bg-amber-400'
                        : 'bg-orange-500'
                    }`}>
                      {currentParcel.status.replace('_', ' ')}
                    </span>
                  </h1>

                  <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                    {currentParcel.status_detail}
                  </p>
                </div>

                {/* Estimated Delivery Metric */}
                <div className="bg-[#0b0c0e] border border-[#2b3036] p-5 rounded-sm lg:min-w-[280px] shrink-0">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Estimated Delivery
                  </div>
                  <div className="text-2xl font-black text-orange-400 mt-1 font-mono">
                    {currentParcel.estimated_delivery.date}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5 font-mono">
                    Window: {currentParcel.estimated_delivery.time_window}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#23272b] flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Carrier Status:</span>
                    <span className="text-emerald-400 font-bold">On Schedule</span>
                  </div>
                </div>
              </div>

              {/* Progress Stepper with Smooth Transitions */}
              <div className="mt-8 pt-6 border-t border-[#23272b]">
                {/* Stepper Header / Status Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    Live Stage Progression Monitor
                  </span>
                  <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                    <span className="text-zinc-500">Active State:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono transition-colors duration-500 ${
                      currentParcel.status === 'on_hold'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : currentParcel.status === 'delivered'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    }`}>
                      {currentParcel.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper Nodes & Connecting Lines */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
                  {currentParcel.stages.map((stage, idx) => {
                    const isCompleted = stage.completed;
                    const isCurrent = stage.current;
                    const isHold = stage.isHold;

                    return (
                      <div key={idx} className="flex flex-col items-center group">
                        <div className="relative flex items-center justify-center w-full mb-3">
                          {/* Connecting Line to next step */}
                          {idx < currentParcel.stages.length - 1 && (
                            <div className="hidden sm:block absolute top-1/2 left-1/2 w-full h-1.5 bg-[#202327] -translate-y-1/2 z-0 rounded-full overflow-hidden border border-[#2b3036]/60">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 transition-all duration-700 ease-in-out rounded-full"
                                style={{
                                  width: isCompleted ? '100%' : isCurrent ? '50%' : '0%',
                                }}
                              />
                            </div>
                          )}

                          {/* Stepper Circle Icon Badge */}
                          <div
                            className={`relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-700 ease-in-out transform cursor-default ${
                              isCompleted
                                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/35 scale-100 ring-2 ring-orange-400/50'
                                : isCurrent && isHold
                                ? 'bg-amber-500 text-black ring-4 ring-amber-500/50 shadow-xl shadow-amber-500/40 scale-110 animate-pulse'
                                : isCurrent
                                ? 'bg-orange-500 text-black ring-4 ring-orange-500/50 shadow-xl shadow-orange-500/40 scale-110'
                                : 'bg-[#16181b] text-zinc-500 border-2 border-[#2b3036] scale-95 group-hover:border-zinc-500'
                            }`}
                          >
                            {/* Pulsing Aura Ripple on Current Step */}
                            {isCurrent && (
                              <span
                                className={`absolute -inset-1 rounded-full animate-ping opacity-35 pointer-events-none ${
                                  isHold ? 'bg-amber-400 ring-2 ring-amber-400' : 'bg-orange-400 ring-2 ring-orange-400'
                                }`}
                              />
                            )}

                            {/* Icon Transition */}
                            <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-out transform">
                              {isCompleted ? (
                                <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3] text-black transition-all duration-500 transform animate-in zoom-in-50" />
                              ) : isCurrent ? (
                                isHold ? (
                                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-black animate-bounce transition-all duration-500" />
                                ) : idx === 2 ? (
                                  <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-black rotate-45 animate-pulse transition-all duration-500" />
                                ) : idx === 3 ? (
                                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-black animate-pulse transition-all duration-500" />
                                ) : idx === 4 ? (
                                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-black animate-bounce transition-all duration-500" />
                                ) : (
                                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-black animate-pulse transition-all duration-500" />
                                )
                              ) : (
                                <span className="transition-opacity duration-500 opacity-60">
                                  {idx === 0 ? (
                                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                                  ) : idx === 1 ? (
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                                  ) : idx === 2 ? (
                                    <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 rotate-45" />
                                  ) : idx === 3 ? (
                                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                                  ) : (
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Title & Timestamp */}
                        <div className="text-center w-full">
                          <span
                            className={`block text-[11px] sm:text-xs font-bold leading-tight transition-colors duration-500 ${
                              isCurrent
                                ? isHold
                                  ? 'text-amber-400 font-black'
                                  : 'text-orange-400 font-black'
                                : isCompleted
                                ? 'text-white'
                                : 'text-zinc-500'
                            }`}
                          >
                            {stage.title}
                          </span>
                          <span className="block text-[10px] sm:text-[11px] text-zinc-400 font-mono mt-1 transition-colors duration-500">
                            {stage.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Status Switcher in Result View */}
                <div className="mt-8 pt-5 border-t border-[#23272b] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                      Simulate Status Progression:
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeParcelStatus(currentParcel.tracking_code, 'in_transit')}
                      className={`px-3 py-1.5 rounded-sm text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentParcel.status === 'in_transit'
                          ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/30 ring-1 ring-orange-400'
                          : 'bg-[#181a1d] hover:bg-[#252a2f] text-zinc-300 border border-[#2b3036]'
                      }`}
                    >
                      <Plane className="w-3.5 h-3.5 rotate-45" />
                      <span>1. In Air Transit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => changeParcelStatus(currentParcel.tracking_code, 'on_hold')}
                      className={`px-3 py-1.5 rounded-sm text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentParcel.status === 'on_hold'
                          ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30 ring-1 ring-amber-400'
                          : 'bg-[#181a1d] hover:bg-[#252a2f] text-zinc-300 border border-[#2b3036]'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>2. Customs On-Hold</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => changeParcelStatus(currentParcel.tracking_code, 'out_for_delivery')}
                      className={`px-3 py-1.5 rounded-sm text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentParcel.status === 'out_for_delivery'
                          ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/30 ring-1 ring-orange-400'
                          : 'bg-[#181a1d] hover:bg-[#252a2f] text-zinc-300 border border-[#2b3036]'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>3. Out for Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => changeParcelStatus(currentParcel.tracking_code, 'delivered')}
                      className={`px-3 py-1.5 rounded-sm text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentParcel.status === 'delivered'
                          ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
                          : 'bg-[#181a1d] hover:bg-[#252a2f] text-zinc-300 border border-[#2b3036]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>4. Delivered & Signed</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                      className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        isAutoSimulating
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {isAutoSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isAutoSimulating ? 'Stop Auto-Demo' : 'Auto-Play Stages'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Two-Column Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Plane Visual & Audit Timeline (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Freight Aircraft Image Spotlight */}
                <div className="bg-[#141618] border border-[#23272b] rounded-sm overflow-hidden">
                  <div className="relative h-60 w-full bg-[#181a1d]">
                    <img
                      src="/images/logistics_cargo_plane.jpg"
                      alt="Apex Air Freight Cargo Plane in Transit"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center filter brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141618] via-transparent to-black/40"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                      <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded border border-orange-500/40 text-orange-400 font-mono font-semibold">
                        Flight APX-9481 &middot; Cruising FL380
                      </div>
                      <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 font-mono">
                        Container: ULD-APX-9941B
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-zinc-500 block uppercase font-semibold text-[10px]">Origin Port</span>
                        <span className="text-white font-bold text-sm block mt-0.5">
                          {currentParcel.origin.city}, {currentParcel.origin.country}
                        </span>
                        <span className="text-zinc-400 font-mono text-[11px]">{currentParcel.origin.facility}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase font-semibold text-[10px]">
                          Destination Hub
                        </span>
                        <span className="text-white font-bold text-sm block mt-0.5">
                          {currentParcel.destination.city}, {currentParcel.destination.country}
                        </span>
                        <span className="text-zinc-400 font-mono text-[11px]">{currentParcel.destination.address}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase font-semibold text-[10px]">Air Transit Type</span>
                        <span className="text-orange-400 font-bold text-sm block mt-0.5 font-mono">
                          Direct Airway Express
                        </span>
                        <span className="text-zinc-400 text-[11px]">Clearance Pre-Approved</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestone Audit Trail */}
                <div className="bg-[#141618] border border-[#23272b] rounded-sm p-6">
                  <div className="flex items-center justify-between border-b border-[#23272b] pb-4 mb-6">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Transit History & Radar Log</span>
                    </h2>
                    <span className="text-xs text-zinc-400 font-mono">UTC Timestamp</span>
                  </div>

                  <div className="relative border-l-2 border-orange-500/40 ml-3 space-y-6 text-xs">
                    {currentParcel.timeline.map((event, idx) => (
                      <div key={idx} className="relative pl-6">
                        <span
                          className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-[#141618] flex items-center justify-center ${
                            idx === 0 ? 'bg-orange-500' : 'bg-zinc-600'
                          }`}
                        >
                          {idx === 0 && <span className="w-1.5 h-1.5 bg-black rounded-full"></span>}
                        </span>
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <span className={`font-bold text-sm ${idx === 0 ? 'text-white' : 'text-zinc-300'}`}>
                            {event.status}
                          </span>
                          <span className="text-orange-400 font-mono font-semibold">
                            {event.date} &middot; {event.time}
                          </span>
                        </div>
                        <div className="text-zinc-400 font-mono text-[11px] mb-1">{event.location}</div>
                        <p className="text-zinc-400 leading-relaxed">{event.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Specs & Actions (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Consignment Specs */}
                <div className="bg-[#141618] border border-[#23272b] rounded-sm p-6 border-t-2 border-t-orange-500">
                  <div className="flex items-center justify-between border-b border-[#23272b] pb-4 mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Waybill Specs
                    </h3>
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded text-[10px] font-mono uppercase font-semibold">
                      {currentParcel.specs.service_class}
                    </span>
                  </div>

                  <dl className="divide-y divide-[#23272b] text-xs font-mono">
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-zinc-400">Gross Weight:</dt>
                      <dd className="text-white font-semibold">{currentParcel.specs.weight}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-zinc-400">Dimensions:</dt>
                      <dd className="text-white font-semibold">{currentParcel.specs.dimensions}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-zinc-400">Package Units:</dt>
                      <dd className="text-white font-semibold">{currentParcel.specs.pieces} Piece</dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-zinc-400">Declared Value:</dt>
                      <dd className="text-orange-400 font-bold">{currentParcel.specs.declared_value}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-zinc-400">Signature Required:</dt>
                      <dd className="text-emerald-400 font-semibold">
                        {currentParcel.specs.signature_required ? 'Yes (Strict Consignee ID)' : 'No'}
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <dt className="text-zinc-400">Insurance:</dt>
                      <dd className="text-white font-semibold">{currentParcel.specs.insurance}</dd>
                    </div>
                  </dl>

                  {/* Sender & Recipient */}
                  <div className="mt-6 pt-4 border-t border-[#23272b] space-y-4">
                    <div className="bg-[#0e0f11] p-3 rounded-sm border border-[#23272b]">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">
                        Shipper / Consignor
                      </span>
                      <div className="text-xs font-bold text-white">{currentParcel.sender.name}</div>
                      <div className="text-[11px] text-zinc-400">
                        {currentParcel.sender.city}, {currentParcel.sender.country}
                      </div>
                    </div>

                    <div className="bg-[#0e0f11] p-3 rounded-sm border border-[#23272b]">
                      <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider block mb-1">
                        Consignee / Recipient
                      </span>
                      <div className="text-xs font-bold text-white">{currentParcel.destination.recipient}</div>
                      <div className="text-[11px] text-zinc-400">{currentParcel.destination.address}</div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="w-full py-2.5 bg-[#1b1e22] hover:bg-[#252a2f] text-white text-xs font-bold uppercase tracking-wider rounded-sm border border-[#2e3338] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-orange-400" />
                      <span>Print Consignment Waybill</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '/#/result?code=' + currentParcel.tracking_code);
                        showToast('Direct waybill link copied to clipboard!');
                      }}
                      className="w-full py-2.5 bg-[#1b1e22] hover:bg-[#252a2f] text-white text-xs font-bold uppercase tracking-wider rounded-sm border border-[#2e3338] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-orange-400" />
                      <span>Copy Shareable Link</span>
                    </button>
                  </div>
                </div>

                {/* Egypt Hold Customs Hub Link */}
                <div className="bg-[#141618] border border-amber-500/40 rounded-sm p-5 border-l-4 border-l-amber-500">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Egypt Customs Authority Detention
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Access official Egyptian customs inspection protocols and cargo clearance procedures for detained shipments.
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            navigateTo('on_hold');
                          }}
                          className="px-3 py-1.5 bg-black border border-amber-500/60 hover:border-amber-400 text-amber-300 font-semibold rounded font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Egypt Customs Quarantine Terminal &rarr;</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FULL ACTIVITY LOG COMPONENT: Detailed Historical Audit Trail */}
            <div className="mt-8">
              <FullActivityLog
                parcelId={currentParcel.tracking_code}
                currentStatus={currentParcel.status}
                refreshTrigger={auditRefreshTrigger}
                onStatusChangeTriggered={(newStatus) => {
                  changeParcelStatus(currentParcel.tracking_code, newStatus, true);
                }}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: ON-HOLD IN EGYPT VIEW */}
        {activeTab === 'on_hold' && (
          <div className="space-y-8">
            {/* Caution Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab('track')} className="hover:text-white underline cursor-pointer">
                  Apex Tracking Hub
                </button>
                <span>/</span>
                <span>Customs Retention Bay</span>
                <span>/</span>
                <span className="text-amber-400 font-mono font-semibold">CAI-T2 (Cairo, Egypt)</span>
                <span>/</span>
                <span className="text-white font-mono font-semibold">{currentParcel.tracking_code}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span className="font-mono text-amber-300 font-bold">Port Alert: Consignment Detained</span>
              </div>
            </div>

            {/* Master Alert Banner: On Hold in Egypt */}
            <section className="bg-[#161412] border border-amber-500/60 rounded-sm p-6 sm:p-8 border-l-4 border-l-amber-500 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2 font-mono">
                    <span className="text-amber-400 font-bold tracking-wider">
                      CONSIGNMENT # {currentParcel.tracking_code}
                    </span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="text-zinc-300">Port of Cairo (CAI)</span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="text-red-400 font-semibold">
                      Notice: {currentParcel.hold_info?.hold_code || 'EGY-GOV-CUST-883'}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase flex flex-wrap items-center gap-3">
                    <span>Package is on hold in Egypt</span>
                    <span className="inline-flex items-center px-3 py-1 bg-amber-500 text-black text-xs font-black rounded-sm uppercase tracking-wider">
                      ON HOLD (CAIRO)
                    </span>
                  </h1>

                  <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
                    {currentParcel.status_detail}
                  </p>
                </div>

                {/* Detention Order Metric Box */}
                <div className="bg-[#0c0b0a] border border-amber-500/40 p-5 rounded-sm lg:min-w-[300px] shrink-0">
                  <div className="text-[11px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Detention Order Notice</span>
                  </div>
                  <div className="text-lg font-black text-white mt-1 font-mono">
                    ECA Terminal 2 Hold
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 font-mono">
                    Facility: Bay B-4, Cairo Airport
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#23272b] flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Clearance Assessment:</span>
                    <span className="text-amber-400 font-bold">
                      {currentParcel.hold_info?.clearance_fee || 'EGP 1,450 (~$30 USD)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Stepper with Hold Highlight */}
              <div className="mt-8 pt-6 border-t border-[#2a2622]">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-black font-extrabold flex items-center justify-center text-xs">✓</div>
                      <div className="h-1 flex-grow bg-orange-500 rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold text-white">Picked Up</span>
                    <span className="text-[11px] text-zinc-400 font-mono">Origin Depot</span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-black font-extrabold flex items-center justify-center text-xs">✓</div>
                      <div className="h-1 flex-grow bg-orange-500 rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold text-white">Arrived Egypt</span>
                    <span className="text-[11px] text-zinc-400 font-mono">Cairo Hub (CAI)</span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-xs ring-4 ring-amber-500/40 animate-pulse">!</div>
                      <div className="h-1 flex-grow bg-[#2b3036] rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">On Hold in Egypt</span>
                    <span className="text-[11px] text-amber-300 font-mono">Customs Detained</span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#1e2226] text-zinc-500 font-bold flex items-center justify-center text-xs">4</div>
                      <div className="h-1 flex-grow bg-[#2b3036] rounded-full"></div>
                    </div>
                    <span className="text-xs font-medium text-zinc-500">Customs Release</span>
                    <span className="text-[11px] text-zinc-600 font-mono">Awaiting Documents</span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#1e2226] text-zinc-500 font-bold flex items-center justify-center text-xs">5</div>
                    </div>
                    <span className="text-xs font-medium text-zinc-500">Final Delivery</span>
                    <span className="text-[11px] text-zinc-600 font-mono">Pending</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Two Column Layout for Egypt Hold */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Cairo Terminal Photography & Incident Log (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#141618] border border-[#23272b] rounded-sm overflow-hidden">
                  <div className="relative h-64 w-full bg-[#181a1d]">
                    <img
                      src="/images/cairo_cargo_hub.jpg"
                      alt="Cairo International Airport Air Cargo Customs Terminal 2"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center filter brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141618] via-transparent to-black/50"></div>
                    <div className="absolute top-4 left-4 bg-amber-500 text-black px-3 py-1 font-mono font-black text-xs uppercase tracking-wider rounded-sm shadow-lg">
                      Official Detention Facility
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                      <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded border border-amber-500/40 text-amber-300 font-mono font-semibold">
                        Station: Cairo Airport (CAI) Terminal 2 Air Cargo Village
                      </div>
                      <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 font-mono">
                        Inspection Bay B-4 &middot; Bonded Warehouse
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                          Egyptian Customs Authority Formal Retention
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          The package is safely stored inside the temperature-controlled bonded room at Cairo Airport. It cannot proceed to the delivery courier until commercial customs declaration ECA-41 is approved by the assigned clearing officer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customs Inspection Timeline */}
                <div className="bg-[#141618] border border-[#23272b] rounded-sm p-6">
                  <div className="flex items-center justify-between border-b border-[#23272b] pb-4 mb-6">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Port & Customs Retention Audit</span>
                    </h2>
                    <span className="text-xs text-amber-400 font-mono font-semibold">State: ON HOLD</span>
                  </div>

                  <div className="relative border-l-2 border-amber-500/50 ml-3 space-y-6 text-xs">
                    <div className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-[#141618] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                      </span>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-amber-400 text-sm">
                          Shipment Detained by Egyptian Customs Authority
                        </span>
                        <span className="text-amber-400 font-mono font-semibold">Today &middot; 09:15 UTC+2</span>
                      </div>
                      <div className="text-zinc-400 font-mono text-[11px] mb-1">
                        Cairo International Airport (CAI), Egypt &middot; Inspection Bay B-4
                      </div>
                      <p className="text-zinc-300 leading-relaxed">
                        Automated optical scan flagged package for statutory tariff classification. Officer Tariq Al-Farouk issued formal retention order EGY-GOV-CUST-883.
                      </p>
                    </div>

                    <div className="relative pl-6">
                      <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-zinc-600 ring-4 ring-[#141618]"></span>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-white text-sm">Arrived at Cairo International Hub</span>
                        <span className="text-zinc-400 font-mono">Yesterday &middot; 18:30 UTC+2</span>
                      </div>
                      <div className="text-zinc-400 font-mono text-[11px] mb-1">Cairo Airport Cargo Village</div>
                      <p className="text-zinc-400 leading-relaxed">
                        Container offloaded from inbound cargo flight and moved into customs bond transit room.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Resolution Actions, Form, Contact (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Customs Release Protocol Card */}
                <div className="bg-[#141618] border border-amber-500/40 rounded-sm p-6 border-t-2 border-t-amber-500">
                  <div className="flex items-center justify-between border-b border-[#23272b] pb-4 mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Release Protocol
                    </h3>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-mono uppercase font-semibold">
                      Action Required
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                    To release the package held in Egypt, the designated consignee must complete the clearance steps:
                  </p>

                  <div className="space-y-3 text-xs mb-6">
                    <div className="flex items-start gap-2.5 p-2.5 bg-[#0e0f11] rounded border border-[#23272b]">
                      <span className="text-amber-400 font-bold font-mono">1.</span>
                      <div>
                        <strong className="text-white block">Commercial Invoice & HS Codes</strong>
                        <span className="text-[11px] text-zinc-400">Itemized valuation for Egyptian customs duties.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 bg-[#0e0f11] rounded border border-[#23272b]">
                      <span className="text-amber-400 font-bold font-mono">2.</span>
                      <div>
                        <strong className="text-white block">Consignee Identity & Tax ID</strong>
                        <span className="text-[11px] text-zinc-400">National ID / Passport copy or Tax Card.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 bg-[#0e0f11] rounded border border-[#23272b]">
                      <span className="text-amber-400 font-bold font-mono">3.</span>
                      <div>
                        <strong className="text-white block">Form ECA-41 Declaration Stamp</strong>
                        <span className="text-[11px] text-zinc-400">Administrative assessment fee of EGP 1,450.</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Release Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowDocsModal(true)}
                      className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-extrabold uppercase tracking-wider text-xs rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Submit Clearance Documents</span>
                    </button>

                    <button
                      onClick={releaseEgyptHold}
                      className="w-full py-2.5 bg-[#1b1e22] hover:bg-[#252a2f] text-emerald-400 hover:text-emerald-300 border border-emerald-600/40 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simulate Instant Hold Release &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Cairo Customs Desk Contact */}
                <div className="bg-[#141618] border border-[#23272b] rounded-sm p-6 border-l-4 border-l-orange-500">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
                    Cairo Port Officer Contact
                  </h3>
                  <div className="space-y-2 text-xs font-mono text-zinc-300">
                    <div className="flex justify-between py-1 border-b border-[#23272b]">
                      <span className="text-zinc-500">Inspection Office:</span>
                      <span className="text-white font-semibold">Cairo Cargo Village Terminal 2</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#23272b]">
                      <span className="text-zinc-500">Supervising Inspector:</span>
                      <span className="text-white font-semibold">Tariq Al-Farouk (ECA-771)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#23272b]">
                      <span className="text-zinc-500">Direct Telephone:</span>
                      <span className="text-orange-400 font-semibold">+20 2 2265 0000 (Ext 4120)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#23272b]">
                      <span className="text-zinc-500">Official Email:</span>
                      <span className="text-orange-400 font-semibold">clearance-cairo@apex-logistics.eg</span>
                    </div>
                  </div>
                </div>

                {/* Return button */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      navigateTo('result');
                    }}
                    className="text-xs text-orange-400 hover:text-orange-300 font-mono font-semibold underline cursor-pointer"
                  >
                    &larr; Return to In-Transit Result View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: DISPATCHER TERMINAL & LOGISTICS CONTROLS */}
        {activeTab === 'dispatcher' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
                <span className="text-xs font-mono text-orange-400 uppercase font-bold tracking-wider">
                  Logistics Dispatcher & Station Manager
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Parcel Status Management Terminal
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Enforces verification matching <code className="text-orange-300">middleware/auth.js</code>. Authenticate with dispatcher or customs credentials to transition parcel statuses.
              </p>
            </div>

            {/* Dispatcher Form */}
            <div className="bg-[#141618] border border-[#2e3338] rounded-sm p-6">
              <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold uppercase">
                    Dispatcher Authorization Key
                  </label>
                  <input
                    type="text"
                    value={dispatcherPin}
                    onChange={(e) => setDispatcherPin(e.target.value)}
                    className="w-full bg-[#0a0b0d] border border-[#2b3036] px-3 py-2.5 rounded text-white font-mono focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Valid test keys: <strong className="text-zinc-300">APEX-DISPATCH-990</strong> (Fleet Dispatcher), <strong className="text-zinc-300">EGY-CUST-AUTH-41</strong> (Cairo Customs Officer), <strong className="text-zinc-300">DEMO-KEY-2026</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-semibold uppercase">Select Parcel</label>
                    <select
                      value={targetParcelSelect}
                      onChange={(e) => setTargetParcelSelect(e.target.value)}
                      className="w-full bg-[#0a0b0d] border border-[#2b3036] px-3 py-2.5 rounded text-white font-mono focus:border-orange-500 focus:outline-none"
                    >
                      {Object.values(parcels).map((p) => (
                        <option key={p.tracking_code} value={p.tracking_code}>
                          {p.tracking_code} &mdash; Current: {p.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-semibold uppercase">Set New Status</label>
                    <select
                      value={newStatusSelect}
                      onChange={(e) => setNewStatusSelect(e.target.value as any)}
                      className="w-full bg-[#0a0b0d] border border-[#2b3036] px-3 py-2.5 rounded text-white font-mono focus:border-orange-500 focus:outline-none"
                    >
                      <option value="in_transit">in_transit &mdash; Package is on its way</option>
                      <option value="on_hold">on_hold &mdash; Package is on hold in Egypt</option>
                      <option value="out_for_delivery">out_for_delivery &mdash; Out for Delivery</option>
                      <option value="delivered">delivered &mdash; Delivered</option>
                    </select>
                  </div>
                </div>

                {statusLog && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 rounded text-xs font-mono">
                    {statusLog}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('apex_parcels_db');
                      setParcels(INITIAL_PARCELS);
                      showToast('Database reset to defaults.');
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded cursor-pointer"
                  >
                    Reset All Parcels to Default
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-extrabold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
                  >
                    <span>Commit Status Update</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Table of all parcels in database */}
            <div className="bg-[#141618] border border-[#23272b] rounded-sm p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
                Local Database Records (database/users.db & database/parcels.json)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#23272b] text-zinc-400">
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Route</th>
                      <th className="py-2.5 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23272b]">
                    {Object.values(parcels).map((p) => (
                      <tr key={p.tracking_code} className="hover:bg-[#1a1d20]">
                        <td className="py-2.5 px-3 font-bold text-white">{p.tracking_code}</td>
                        <td className="py-2.5 px-3">
                          {p.status === 'in_transit' ? (
                            <span className="text-orange-400 font-semibold">● On Its Way</span>
                          ) : p.status === 'on_hold' ? (
                            <span className="text-amber-400 font-semibold">● On Hold (Egypt)</span>
                          ) : (
                            <span className="text-emerald-400">● {p.status}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400">
                          {p.origin.city} &rarr; {p.destination.city}
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => {
                              if (p.status === 'on_hold') {
                                navigateTo('on_hold', p.tracking_code);
                              } else {
                                navigateTo('result', p.tracking_code);
                              }
                            }}
                            className="text-orange-400 hover:text-white underline cursor-pointer"
                          >
                            Inspect View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: LOGOUT / SESSION TERMINATED VIEW */}
        {activeTab === 'logout' && (
          <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <button onClick={() => navigateTo('track')} className="hover:text-white underline cursor-pointer">
                  Apex Hub
                </button>
                <span>/</span>
                <span>Security &amp; Authorization</span>
                <span>/</span>
                <span className="text-orange-400 font-mono font-semibold">Session Terminated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-emerald-400 font-semibold">Terminal State: Secure Disconnect</span>
              </div>
            </div>

            {/* Master Logout Status Banner */}
            <section className="bg-[#141618] border border-orange-500/50 rounded-sm p-6 sm:p-8 border-l-4 border-l-orange-500 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none text-9xl font-black text-orange-500 font-mono select-none">
                LOGOUT
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2 font-mono">
                    <span className="text-orange-400 font-bold tracking-wider">
                      SESSION # APX-LOGOUT-9921
                    </span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="text-zinc-300">Terminal Dispatch Node CAI/FRA</span>
                    <span aria-hidden="true">&middot;</span>
                    <span className="text-emerald-400 font-semibold">Status: Cleared &amp; Safe</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase flex flex-wrap items-center gap-3">
                    <span>You Have Been Logged Out</span>
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black rounded-sm uppercase tracking-wider">
                      SAFE DISCONNECT
                    </span>
                  </h1>

                  <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
                    Your active dispatch and tracking session on <strong>APEXEXPRESS</strong> has been securely closed. All cached authentication tokens, carrier dispatch keys, and temporary manifest records have been safely cleared from this terminal.
                  </p>
                </div>

                {/* Session Metric Box */}
                <div className="bg-[#0b0c0e] border border-[#2e3338] p-5 rounded-sm lg:min-w-[320px] shrink-0">
                  <div className="text-[11px] uppercase tracking-wider text-orange-400 font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Security Manifest Summary</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-[#1f2327]">
                      <span className="text-zinc-500">Account:</span>
                      <span className="text-white font-semibold">joeldan228@gmail.com</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1f2327]">
                      <span className="text-zinc-500">Access Level:</span>
                      <span className="text-orange-400 font-semibold">Priority Account</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1f2327]">
                      <span className="text-zinc-500">Security Cipher:</span>
                      <span className="text-emerald-400 font-semibold">TLS 1.3 / Revoked</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500">Tokens:</span>
                      <span className="text-emerald-400 font-semibold">Purged from Memory</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Two-Column Grid: Quick Parcel Lookup & Re-authentication */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Quick Tracking Lookup (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#141618] border border-[#23272b] rounded-sm p-6 sm:p-8 border-t-2 border-t-orange-500">
                  <div className="flex items-center justify-between border-b border-[#23272b] pb-4 mb-5">
                    <div>
                      <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Search className="w-5 h-5 text-orange-500" />
                        Track Consignment Without Logging In
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">Public tracking lookups remain accessible without an authenticated account.</p>
                    </div>
                  </div>

                  <form onSubmit={handleTrackSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="logout-parcel-input" className="block text-xs font-mono font-bold text-orange-400 uppercase tracking-widest mb-1.5">
                        ENTER PARCEL CODE
                      </label>
                      <div className="relative">
                        <input
                          id="logout-parcel-input"
                          type="text"
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                          placeholder="ENTER PARCEL CODE"
                          className="w-full px-4 py-3.5 bg-[#0a0b0d] border border-[#2b3036] rounded-sm text-white placeholder-zinc-500 font-mono text-base font-bold tracking-wider focus:outline-none focus:border-orange-500 uppercase"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-extrabold uppercase tracking-wider text-xs rounded-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
                      >
                        <span>Track Parcel Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <a
                        href="track.html"
                        className="py-3.5 px-6 bg-[#1b1e22] hover:bg-[#252a2f] text-white border border-[#2e3338] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors text-center flex items-center justify-center cursor-pointer"
                      >
                        Return to track.html &rarr;
                      </a>
                    </div>
                  </form>

                  {/* Pre-seeded quick tracks */}
                  <div className="mt-6 pt-5 border-t border-[#23272b]">
                    <span className="text-xs text-zinc-400 font-mono block mb-2">Frequently Tracked Air Consignments:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInputCode('DELI01474');
                          navigateTo('result', 'DELI01474');
                        }}
                        className="px-3 py-1.5 bg-[#0b0c0e] hover:bg-orange-500/10 border border-[#2e3338] hover:border-orange-500 text-xs font-mono text-zinc-300 hover:text-orange-400 rounded transition-colors cursor-pointer"
                      >
                        DELI01474 <span className="text-zinc-500 text-[10px]">&middot; Frankfurt to Cairo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputCode('DELI08821');
                          navigateTo('result', 'DELI08821');
                        }}
                        className="px-3 py-1.5 bg-[#0b0c0e] hover:bg-orange-500/10 border border-[#2e3338] hover:border-orange-500 text-xs font-mono text-zinc-300 hover:text-orange-400 rounded transition-colors cursor-pointer"
                      >
                        DELI08821 <span className="text-amber-500 text-[10px]">&middot; Cairo Customs Bond</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Reopen Dispatcher & Security Tips (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#141618] border border-[#23272b] rounded-sm p-6 border-l-4 border-l-orange-500">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">Reopen Secure Session</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                    Need to update shipment states, sign off on customs releases, or manage air freight manifests?
                  </p>

                  <button
                    type="button"
                    onClick={() => navigateTo('dispatcher')}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-black font-extrabold uppercase tracking-wider text-xs rounded-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Sign Back In to Dispatcher</span>
                  </button>
                </div>

                <div className="bg-[#141618] border border-[#23272b] rounded-sm p-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Terminal Security Protocol
                  </h3>
                  <ul className="space-y-2.5 text-xs text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">&check;</span>
                      <span><strong>Shared Computers:</strong> Close this browser window to prevent cached page history access.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">&check;</span>
                      <span><strong>Air Cargo Clearances:</strong> Sensitive consignments require re-entering the dispatcher PIN.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 font-bold">&check;</span>
                      <span><strong>24/7 Security Desk:</strong> Reach operations at <span className="font-mono text-white">security@apex-express.com</span>.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Egyptian Customs Document Submission Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141618] border border-[#2e3338] w-full max-w-lg rounded-sm p-6 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-[#23272b] pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  Egyptian Customs Document Portal
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Terminal 2 Air Cargo Village Clearance Desk &middot; Case #EGY-GOV-CUST-883
                </p>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDocsSubmitted(true);
                setTimeout(() => {
                  releaseEgyptHold();
                }, 1400);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold uppercase">
                  Consignee Full Name / Tax Entity
                </label>
                <input
                  type="text"
                  defaultValue="Joel Dan (Apex Priority Account)"
                  className="w-full bg-[#0b0c0e] border border-[#2e3338] px-3 py-2 rounded text-white font-mono focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold uppercase">
                  Egyptian National ID / Tax ID Number
                </label>
                <input
                  type="text"
                  defaultValue="28409180104829"
                  className="w-full bg-[#0b0c0e] border border-[#2e3338] px-3 py-2 rounded text-white font-mono focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold uppercase">
                  Commercial Invoice & Declaration Attachment
                </label>
                <div className="border-2 border-dashed border-[#2e3338] p-4 rounded text-center bg-[#0b0c0e]">
                  <UploadCloud className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <span className="text-zinc-300 font-semibold block font-mono">
                    commercial_invoice_{currentParcel.tracking_code}.pdf
                  </span>
                  <span className="text-[10px] text-zinc-500">File verified & attached (1.4 MB)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="doc-chk" defaultChecked className="accent-orange-500 w-4 h-4 rounded" />
                <label htmlFor="doc-chk" className="text-[11px] text-zinc-300">
                  I certify that the goods meet Egyptian import customs regulations and agree to statutory assessment.
                </label>
              </div>

              {docsSubmitted && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded font-mono text-xs">
                  <strong>Clearance In Review:</strong> Documents submitted to Officer Tariq Al-Farouk. Release protocol executing...
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDocsModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docsSubmitted}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded uppercase tracking-wider flex items-center gap-2 shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
                >
                  <span>Submit to Customs Authority</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-[#0a0b0d] border-t border-[#23272b] py-8 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-zinc-400 font-bold uppercase tracking-wider">APEXEXPRESS GLOBAL FREIGHT</span>
            <span>&middot;</span>
            <span>Cairo Cargo Village &middot; Frankfurt Gateway &middot; Rotterdam Port</span>
          </div>
          <div className="font-mono text-zinc-500">
            APEXEXPRESS Logistics Network &middot; 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
