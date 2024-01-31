// © 2024 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from "pinia";
import {defaultProgram, stages} from '@/defaults';
import type {ProgramInterface, ISessionState, PayloadInterface, Parameters, GlobalParameters} from "@/types";

const currentYear = new Date().getFullYear();
const nextValidYearPast = Math.floor( currentYear / 5) * 5;
const nextValidYearFuture = Math.ceil( currentYear / 5) * 5;

const getCurrentYear = (future: boolean) => {
  return future ? currentYear : nextValidYearPast;
};
const getYears = (future: boolean) => {
  if (future) return [currentYear, nextValidYearFuture + 5, nextValidYearFuture + 10];
  return [nextValidYearPast - 10, nextValidYearPast - 5, nextValidYearPast];
};

export const useSessionStore = defineStore({
  id: "session",
  state: (): ISessionState => {
    return {
      currentYear: parseInt(localStorage.getItem("currentYear") || getCurrentYear(String(localStorage.getItem("future") || "false").toLowerCase() === "true").toString()),
      stage: parseInt(localStorage.getItem("stage") || stages.home.toString()),
      future: String(localStorage.getItem("future") || "false").toLowerCase() === "true",
      region: parseInt(localStorage.getItem("region") || "0"),
      municipality: String(localStorage.getItem("municipality") || "false").toLowerCase() === "true",
      unit: parseInt(localStorage.getItem("unit") || "1"),
      inhabitants: parseInt(localStorage.getItem("inhabitants") || "100000"),
      years: JSON.parse(localStorage.getItem("years") || JSON.stringify(getYears(String(localStorage.getItem("future") || "false").toLowerCase() === "true"))),
      programs: JSON.parse(localStorage.getItem("programs") || JSON.stringify([structuredClone(defaultProgram)])),
      payload: {"measures": [], "parameters": {}},
      resetted: false,
      results: {},
      globalParameters: JSON.parse(localStorage.getItem("globalParameters") || JSON.stringify({})),
      subsectorMapping: JSON.parse(localStorage.getItem("subsectorMapping") || JSON.stringify({})),
      carrierMapping: JSON.parse(localStorage.getItem("carrierMapping") || JSON.stringify({})),
      monetisationFactorMapping: JSON.parse(localStorage.getItem("monetisationFactorMapping") || JSON.stringify({})),
      parameters: JSON.parse(localStorage.getItem("parameters") || JSON.stringify({})),
      useRenovationRate: String(localStorage.getItem("useRenovationRate") || "false").toLowerCase() === "true",
      seedInfo: String(localStorage.getItem("seedInfo") || "true").toLowerCase() === "true",
    }
  },
  actions: {
    updateStage(stage: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("stage", stage.toString());
    },
    updateFuture(future: boolean, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("future", future.toString());
    },
    updateRegion(region: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("region", region.toString());
    },
    updateMunicipality(municipality: boolean, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("municipality", municipality.toString());
    },
    updateUnit(unit: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("unit", unit.toString());
    },
    updateInhabitants(inhabitants: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("inhabitants", inhabitants.toString());
    },
    updateYears(years: Array<number>, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("years", JSON.stringify(years));
    },
    resetYears(future: boolean) {
      const years = getYears(future);
      this.updateYears(years, false);
      return years;
    },
    updatePrograms(programs: Array<ProgramInterface>, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("programs", JSON.stringify(programs));
    },
    updatePayload(payload: PayloadInterface, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      this.payload = payload;
    },
    updateParameters(parameters: Parameters, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("parameters", JSON.stringify(parameters));
    },
    updateGlobalParameters(globalParameters: GlobalParameters, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("globalParameters", JSON.stringify(globalParameters));
    },
    updateSubsectorMapping(subsectorMapping: {[key: number]: string}, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("subsectorMapping", JSON.stringify(subsectorMapping));
    },
    updateCarrierMapping(carrierMapping: {[key: number]: string}, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("carrierMapping", JSON.stringify(carrierMapping));
    },
    updateMonetisationFactorMapping(monetisationFactorMapping: {[key: number]: string}, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("monetisationFactorMapping", JSON.stringify(monetisationFactorMapping));
    },
    updateUseRenovationRate(useRenovationRate: boolean, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("useRenovationRate", useRenovationRate.toString());
    },
    updateSeedInfo(seedInfo: boolean, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("seedInfo", seedInfo.toString());
    },
    reset() {
      this.resetted = true;
      this.updateStage(stages.home, false);
      this.updateFuture(false, false);
      this.updateRegion(0, false);
      this.updateMunicipality(false, false);
      this.updateUnit(1, false);
      this.updateInhabitants(100000, false);
      this.updateYears(getYears(false), false);
      this.updatePrograms([structuredClone(defaultProgram)], false);
      this.updatePayload({"measures": [], "parameters": {}}, false);
      this.updateParameters({}, false);
      this.updateGlobalParameters({}, false);
      this.updateSubsectorMapping({}, false);
      this.updateCarrierMapping({}, false);
      this.updateMonetisationFactorMapping({}, false);
      this.updateUseRenovationRate(false, false);
      this.updateSeedInfo(true, false);
    },
  },
});
