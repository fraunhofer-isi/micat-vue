// © 2024 Fraunhofer-Gesellschaft e.V., München
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
}
export const defaultProgram: ProgramInterface = {
    name: 'Program 1',
    subsector: 0,
    subsectorName: '',
    improvements: [{ ...defaultImprovement }]
}
export const chartColours: Array<string> = [
  "rgb(252,107,32)",
  "rgb(7,89,133)",
  "rgb(246,218,10)",
  "rgb(45,192,204)",
  "rgb(244,122,32)",
  "rgb(31,149,178)",
  "rgb(255,242,92)",
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
  4: {
    name: "MWh",
    symbol: "MWh",
    factor: 11630
  },
}
