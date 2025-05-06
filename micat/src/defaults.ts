// © 2024 - 2025 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type {ImprovementInterface, ModalInjectInterface, ProgramInterface, UnitsInterface} from "@/types";


export const stages = Object.freeze({ home: 1, full: 2 });
export const defaultModalInject: ModalInjectInterface = {
    showModal: false,
    modalTitle: '',
    modalText: '',
    modalType: '',
    openModal: () => null,
    closeModal: () => null
}
export const defaultImprovement: ImprovementInterface = {
    id: 0,
    internalId: 0,
    values: {},
    percentage: 0,
    showParameterWarning: false,
}
export const defaultProgram: ProgramInterface = {
    name: 'Program 1',
    type: 'energyEfficiency',
    subsector: 0,
    subsectorName: '',
    showSubsectorMenu: false,
    improvements: [{ ...defaultImprovement }]
}
export const chartColours: Array<Array<number>> = [
  [252,107,32],
  [7,89,133],
  [246,218,10],
  [45,192,204],
  [244,122,32],
  [31,149,178],
  [255,242,92],
  [150,40,99],
  [90,114,131],
];
export const units: UnitsInterface = {
  1: {
    name: "ktoe (kilo tonne of oil equivalent)",
    symbol: "ktoe",
    factor: 1
  },
  2: {
    name: "MJ",
    symbol: "MJ",
    factor: 41868000
  },
  3: {
    name: "GJ",
    symbol: "GJ",
    factor: 41868
  },
  5: {
    name: "PJ",
    symbol: "PJ",
    factor: 0.041868
  },
  4: {
    name: "MWh",
    symbol: "MWh",
    factor: 11630
  },
}
export const mureSubsectorMapping: { [key: number]: number } = {
  1: 1,  // General cross-cutting *not used*
  2: 17,  // Household <-> Average residential
  3: 2,  // Industry <-> Average industry
  4: 16,  // Services <-> Average tertiary
  5: 18,  // Transport <-> Average transport
}  