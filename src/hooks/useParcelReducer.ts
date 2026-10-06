/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useReducer } from 'react';
import { ParcelData, ParcelAction, ParcelStatus, Stage } from '../types';
import { INITIAL_PARCELS } from '../data/initialParcels';
import { addAuditLogEntry } from '../utils/auditService';

/**
 * Pure reducer for parcel state management.
 * All updates are immutable - creates new objects instead of mutating existing ones.
 */
function parcelReducer(
  state: Record<string, ParcelData>,
  action: ParcelAction
): Record<string, ParcelData> {
  switch (action.type) {
    case 'SET_STATUS': {
      const parcel = state[action.code];
      if (!parcel) return state;

      const nextStatus = action.status;
      let label = parcel.status_label;
      let detail = parcel.status_detail;
      let updatedStages: Stage[] = [];

      if (nextStatus === 'in_transit') {
        label = 'Package is on its way';
        detail =
          'Your parcel is traveling via international air freight aboard flight APX-9481 from Frankfurt Hub to Cairo Delivery Gateway. Customs export inspection cleared with zero exceptions.';
        updatedStages = [
          { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
          { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
          {
            title: 'In Air Transit',
            current: true,
            completed: false,
            isHold: false,
            timestamp: 'Sept 22, 07:15 UTC',
          },
          { title: 'Import Clearance', completed: false, timestamp: 'Estimated Sept 24' },
          { title: 'Final Delivery', completed: false, timestamp: 'Estimated Sept 26' },
        ];
      } else if (nextStatus === 'on_hold') {
        label = 'Package is on hold in Egypt';
        detail =
          'Shipment is temporarily held at Cairo International Cargo Terminal 2 under Egyptian Customs Authority detention protocol ECA-41 pending commercial duty assessment.';
        updatedStages = [
          { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
          { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
          {
            title: 'Customs Hold (Egypt)',
            current: true,
            completed: false,
            isHold: true,
            timestamp: 'Sept 22, 09:15 UTC+2',
          },
          { title: 'Clearance Release', completed: false, timestamp: 'Pending Consignee Action' },
          { title: 'Final Delivery', completed: false, timestamp: 'Awaiting Release' },
        ];
      } else if (nextStatus === 'out_for_delivery') {
        label = 'Out for Delivery';
        detail =
          'Customs cleared. Parcel has arrived at Cairo Delivery Gateway Depot and is aboard Apex Courier Van #42 en route to the recipient address.';
        updatedStages = [
          { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
          { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
          { title: 'Air Transit Cleared', completed: true, timestamp: 'Sept 22, 16:30 UTC' },
          { title: 'Import Clearance', completed: true, timestamp: 'Sept 23, 08:15 UTC+2' },
          {
            title: 'Out for Final Delivery',
            current: true,
            completed: false,
            timestamp: 'Today, 10:45 UTC+2',
          },
        ];
      } else if (nextStatus === 'delivered') {
        label = 'Delivered & Signed';
        detail =
          'Consignment DELI01474 successfully delivered to Joel Dan at Apex Express Metro Depot, New Cairo Logistics Park. Official delivery receipt signed with biometric verification.';
        updatedStages = [
          { title: 'Picked Up', completed: true, timestamp: 'Sept 21, 14:15 CET' },
          { title: 'Export Customs', completed: true, timestamp: 'Sept 21, 21:40 CET' },
          { title: 'Air Transit Cleared', completed: true, timestamp: 'Sept 22, 16:30 UTC' },
          { title: 'Import Clearance', completed: true, timestamp: 'Sept 23, 08:15 UTC+2' },
          {
            title: 'Delivered & Signed',
            completed: true,
            current: false,
            timestamp: 'Today, 14:20 UTC+2',
          },
        ];
      }

      // Immutable update: create new parcel object
      const updatedParcel: ParcelData = {
        ...parcel,
        status: nextStatus,
        status_label: label,
        status_detail: detail,
        stages: updatedStages,
        hold_info:
          nextStatus === 'on_hold'
            ? parcel.hold_info || {
                location: 'Cairo International Airport Air Cargo Terminal 2, Inspection Bay B-4, Cairo, Egypt',
                hold_code: 'EGY-GOV-CUST-883',
                authority: 'Egyptian Customs Authority (ECA)',
                reason: 'Held for statutory import tariff verification and Form ECA-41 endorsement.',
                hold_timestamp: 'Sep 22, 2026 · 09:15 UTC+2',
                contact_officer: 'Officer Tariq Al-Farouk (Badge #ECA-771)',
                contact_phone: '+20 2 2265 0000 (Ext 4120)',
                contact_email: 'clearance-cairo@apex-logistics.eg',
                clearance_fee: 'EGP 1,450 (~$30.00 USD)',
              }
            : parcel.hold_info,
      };

      // Log audit entry asynchronously
      const prevStatus = parcel.status;
      addAuditLogEntry(action.code, nextStatus, prevStatus, {
        keyUsed: nextStatus === 'on_hold' ? 'EGY-CUST-AUTH-41' : 'APEX-DISPATCH-990',
      }).catch(() => {
        // Silently handle audit log errors
      });

      return {
        ...state,
        [action.code]: updatedParcel,
      };
    }

    case 'RELEASE_HOLD': {
      const parcel = state[action.code];
      if (!parcel) return state;

      // Immutable stage update using .map()
      const releasedStages = parcel.stages.map((stage, index) => {
        if (index === 2) {
          return { ...stage, isHold: false, completed: true };
        }
        if (index === 3) {
          return { ...stage, completed: true, timestamp: 'Released Today' };
        }
        return stage;
      });

      const releasedParcel: ParcelData = {
        ...parcel,
        status: 'in_transit',
        status_label: 'Package is on its way',
        status_detail:
          'Customs clearance approved by Officer Tariq Al-Farouk. Package released from Cairo Cargo Terminal 2 and is on its way to final destination.',
        stages: releasedStages,
        estimated_delivery: {
          ...parcel.estimated_delivery,
          date: 'Tomorrow, September 23, 2026',
        },
      };

      // Log audit entry
      addAuditLogEntry(action.code, 'in_transit', 'on_hold', {
        keyUsed: 'EGY-CUST-AUTH-41',
        reason:
          'Customs quarantine detention released. Form ECA-41 verified and clearance fee receipt confirmed by Officer Tariq Al-Farouk.',
      }).catch(() => {
        // Silently handle audit log errors
      });

      return {
        ...state,
        [action.code]: releasedParcel,
      };
    }

    case 'ADD_PARCEL': {
      return {
        ...state,
        [action.code]: action.parcel,
      };
    }

    case 'AUTO_CYCLE': {
      const parcel = state[action.code];
      if (!parcel) return state;

      const sequence: ParcelStatus[] = ['in_transit', 'on_hold', 'out_for_delivery', 'delivered'];
      const curIndex = sequence.indexOf(parcel.status);
      const nextStatus = sequence[(curIndex + 1) % sequence.length];

      // Delegate to SET_STATUS for consistency
      return parcelReducer(state, {
        type: 'SET_STATUS',
        code: action.code,
        status: nextStatus,
      });
    }

    case 'RESET': {
      return INITIAL_PARCELS;
    }

    default: {
      return state;
    }
  }
}

export function useParcelReducer() {
  return useReducer(parcelReducer, INITIAL_PARCELS);
}
