// © 2024 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
    ParameterCategory,
    ParameterEntry,
    PayloadParameterEntryInterface,
  } from "@/types";

export const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
})
export const scientificFormatter = Intl.NumberFormat('en', {
    notation: 'scientific',
})
export const labelFormatter = Intl.NumberFormat('en', {
    notation: 'standard',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})
export const restructureParameters = (subsectorId: number, name: string, parameters: any) => {
  const restructuredResults: ParameterCategory = {};
  const yearRegex = /^[0-9]+$/;
  
  for (const [category, dataSet] of Object.entries(parameters)) {
    // Use residential parameters for residential subsectors only (which is "average residential" (ID: 17) only)
    // Use fuel switch parameters for fuel switch improvements only
    if (
      category === 'context' || 
      category === 'residential' && [17].indexOf(subsectorId!) == -1 ||
      category === 'fuelSwitch' && !name.toLowerCase().includes('fuel switch')
    ) { continue; }
    // Add category key, if it doesn't exist yet
    if (!restructuredResults[category]) restructuredResults[category] = [];
    for (const data of (dataSet as Array<PayloadParameterEntryInterface>)) {
      if (data.id_parameter === null) continue;
      const entry: ParameterEntry = {
        years: [], 
        parameters: {}, 
        identifier: `${data.id_parameter}-${data.id_final_energy_carrier ? data.id_final_energy_carrier : 'na'}`,
      };
      for (const [key, v] of Object.entries((data as {[key: string]: number | string}))) {
        const value: number = (v as number);
        if (yearRegex.test(key)) {
          // If there's a value for a year, we always take it; alternative values might have null values, but they don't
          // have constants defined, so we also set them
          if (value !== null || typeof data.constants === 'undefined') {
            entry.years.push({key, value});
          }  
        } else {
          entry.parameters[key] = value;
        }
      }
      restructuredResults[category].push(entry);
      // Use real percentage values for the carrier values
      if (entry.parameters.id_parameter === 16) {
        for (const year of entry.years) {
          year.value = year.value * 100;
        }
      }
    }
  }
  if (restructuredResults['fuelSwitch']) {
    // Re-order fuel switch parameters by final energy carrier
    restructuredResults['fuelSwitch'].sort((a, b) => {
      return a['parameters']['id_final_energy_carrier'] < b['parameters']['id_final_energy_carrier'] ? -1 : 1;
    });
  }
  return restructuredResults;
}