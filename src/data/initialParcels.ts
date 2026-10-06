/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParcelData } from '../types';

export const INITIAL_PARCELS: Record<string, ParcelData> = {
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
      {
        title: 'In International Transit',
        current: true,
        completed: false,
        timestamp: 'Sept 22, 07:15 UTC',
      },
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
      {
        title: 'Held at Customs in Egypt',
        current: true,
        isHold: true,
        completed: false,
        timestamp: 'Sept 22, 09:15 UTC+2',
      },
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
      {
        title: 'Held at Customs in Egypt',
        current: true,
        isHold: true,
        completed: false,
        timestamp: 'Sept 22',
      },
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
