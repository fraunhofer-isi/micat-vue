// © 2024 - 2025 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type {
  GlobalParameters,
  ParameterCategory,
  ParameterEntry,
  PayloadParameterInterface,
  PayloadParameterEntryInterface,
} from "@/types";

export const formatter = Intl.NumberFormat('en', {
  notation: 'compact',
})
export const scientificFormatter = Intl.NumberFormat('en', {
  notation: 'scientific',
})
export const labelFormatterSmall = Intl.NumberFormat('en', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
export const labelFormatter = Intl.NumberFormat('en', {
  notation: 'standard',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
export const restructureParameters = (subsectorId: number, name: string, parameters: any) => {
  const restructuredResults: ParameterCategory = {};
  const yearRegex = /^[0-9]+$/;

  for (const [category, dataSet] of Object.entries(parameters)) {
    // Use residential parameters for residential subsectors only (which is "average residential" (ID: 17) only)
    // Use fuel switch parameters for fuel switch improvements only
    if (
      category === 'context' ||
      category === 'residential' && ([17].indexOf(subsectorId!) == -1 && subsectorId < 30) ||
      category === 'fuelSwitch' && !name.toLowerCase().includes('fuel switch')
    ) { continue; }
    // Add category key, if it doesn't exist yet
    if (!restructuredResults[category]) {
      restructuredResults[category] = [];
      // Add efficiency category if fuel switch is present
      if (category === 'fuelSwitch') restructuredResults['efficiency'] = [];
    }
    for (const data of (dataSet as Array<PayloadParameterEntryInterface>)) {
      if (data.id_parameter === null) continue;
      const entry: ParameterEntry = {
        years: [],
        parameters: {},
        identifier: `${data.id_parameter}-${data.id_final_energy_carrier ? data.id_final_energy_carrier : 'na'}`,
      };
      for (const [key, v] of Object.entries((data as { [key: string]: number | string }))) {
        const value: number = (v as number);
        if (yearRegex.test(key)) {
          // If there's a value for a year, we always take it; alternative values might have null values, but they don't
          // have constants defined, so we also set them
          if (value !== null || typeof data.constants === 'undefined') {
            entry.years.push({ key, value });
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
  if (restructuredResults['fuelSwitch'] && restructuredResults['fuelSwitch'].length > 0) {
    // Re-order fuel switch parameters by final energy carrier
    restructuredResults['fuelSwitch'].sort((a, b) => {
      return a['parameters']['id_final_energy_carrier'] < b['parameters']['id_final_energy_carrier'] ? -1 : 1;
    });
    // Move efficiency parameters to own category
    restructuredResults['efficiency'] = restructuredResults['fuelSwitch'].filter((entry: ParameterEntry) => {
      return entry.parameters.label.toString().toLowerCase().includes('efficiency');
    });
    restructuredResults['fuelSwitch'] = restructuredResults['fuelSwitch'].filter((entry: ParameterEntry) => {
      return !entry.parameters.label.toString().toLowerCase().includes('efficiency');
    });
  }
  return Object.keys(restructuredResults).sort((a, b) => a === "main" ? -1 : 1).reduce((r, k) => (r[k] = restructuredResults[k], r), ({} as ParameterCategory));
}
export const getGlobalParametersPayload = (globalParameters: GlobalParameters, monetisationFactorMapping: { [key: number]: string }, region: number) => {
  const results: PayloadParameterInterface = {};
  for (const [category, subsectors] of Object.entries(globalParameters)) {
    results[category] = [];
    for (const [subsector, factors] of Object.entries(subsectors)) {
      for (const [factor, values] of Object.entries(factors)) {
        for (const value of values) {
          if (value.value === null) continue;
          if (category === 'MonetisationFactors') {
            const existingResult: PayloadParameterEntryInterface | undefined = results[category].find(result => {
              return result['index'] === parseInt(factor);
            });
            if (existingResult) {
              existingResult[value.key] = value.value;
            } else {
              const data = {
                'index': parseInt(factor),
                [value.key === 0 ? 'Value' : value.key]: value.value,
                'identifier': monetisationFactorMapping[parseInt(factor)],
              }
              results[category].push(data);
            }
          } else {
            const carrierKey = ['ElectricityGeneration', 'HeatGeneration'].indexOf(category) > -1 ? 'id_primary_energy_carrier' : 'id_final_energy_carrier';
            const existingResult: PayloadParameterEntryInterface | undefined = results[category].find(result => {
              if (['ElectricityGeneration', 'HeatGeneration'].indexOf(category) === -1) {
                return result['id_subsector'] === parseInt(subsector) && result[carrierKey] === value.key;
              } else {
                return result[carrierKey] === value.key;
              }
            });
            if (existingResult && value.value !== null) {
              existingResult[factor] = ['FuelSplitCoefficient', 'HeatGeneration', 'ElectricityGeneration'].indexOf(category) > -1 ? value.value / 100 : value.value;
            } else if (value.value !== null) {
              const data = {
                [carrierKey]: value.key,
                [factor]: ['FuelSplitCoefficient', 'HeatGeneration', 'ElectricityGeneration'].indexOf(category) > -1 ? value.value / 100 : value.value,
              }
              if (['ElectricityGeneration', 'HeatGeneration'].indexOf(category) === -1) data['id_subsector'] = parseInt(subsector);
              if (category === 'EnergyPrice') data['id_region'] = region;
              results[category].push(data);
            }
          }
        }
      }
    }
  }
  return results;
}