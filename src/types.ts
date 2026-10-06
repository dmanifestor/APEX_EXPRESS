/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ParcelStatus = 'in_transit' | 'on_hold' | 'out_for_delivery' | 'delivered';

export interface Stage {
  title: string;
  completed: boolean;
  current?: boolean;
  isHold?: boolean;
  timestamp: string;
}

export interface TimelineEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  detail: string;
  badge: string;
}

export interface ParcelData {
  parcel_id: string;
  tracking_code: string;
  service_type: string;
  status: ParcelStatus;
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

export type ParcelAction =
  | { type: 'SET_STATUS'; code: string; status: ParcelStatus }
  | { type: 'RELEASE_HOLD'; code: string }
  | { type: 'ADD_PARCEL'; code: string; parcel: ParcelData }
  | { type: 'RESET' }
  | { type: 'AUTO_CYCLE'; code: string };

export type AppTab = 'track' | 'result' | 'on_hold' | 'dispatcher' | 'logout';
