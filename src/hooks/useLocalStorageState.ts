/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { ParcelData } from '../types';

/**
 * Syncs parcel state to localStorage on change.
 * Extracted into a reusable hook for separation of concerns.
 */
export function useLocalStorageState(parcels: Record<string, ParcelData>) {
  useEffect(() => {
    try {
      localStorage.setItem('apex_parcels_db', JSON.stringify(parcels));
    } catch {
      // Silently ignore storage errors
    }
  }, [parcels]);
}
