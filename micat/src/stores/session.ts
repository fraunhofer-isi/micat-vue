// © 2024 - 2025 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from "pinia";
import { defaultProgram, stages } from '@/defaults';
import type { CarrierMapping, ProgramInterface, ISessionState, PayloadInterface, Parameters, GlobalParameters, MureTokenInterface } from "@/types";

const currentYear = new Date().getFullYear();
const nextValidYear = Math.floor(currentYear / 5) * 5;

const getYears = () => {
  return [nextValidYear - 10, nextValidYear - 5, nextValidYear];
};

export const useSessionStore = defineStore({
  id: "session",
  state: (): ISessionState => {
    return {
      currentYear: parseInt(localStorage.getItem("currentYear") || currentYear.toString()),
      stage: parseInt(localStorage.getItem("stage") || stages.home.toString()),
      mure: String(localStorage.getItem("mure") || "false").toLowerCase() === "true",
      odyssee: String(localStorage.getItem("odyssee") || "false").toLowerCase() === "true",
      mureToken: JSON.parse(localStorage.getItem("mureToken") || JSON.stringify({})),
      mureCategory: parseInt(localStorage.getItem("mureCategory") || "0"),
      mureCountry: parseInt(localStorage.getItem("mureCountry") || "0"),
      mureMeasurement: parseInt(localStorage.getItem("mureMeasurement") || "0"),
      odysseeStartYear: parseInt(localStorage.getItem("odysseeStartYear") || "2000"),
      odysseeEndYear: parseInt(localStorage.getItem("odysseeEndYear") || "2022"),
      region: parseInt(localStorage.getItem("region") || "0"),
      municipality: String(localStorage.getItem("municipality") || "false").toLowerCase() === "true",
      inhabitants: parseInt(localStorage.getItem("inhabitants") || "100000"),
      years: JSON.parse(localStorage.getItem("years") || JSON.stringify(getYears())),
      programs: JSON.parse(localStorage.getItem("programs") || JSON.stringify([structuredClone(defaultProgram)])),
      payload: { "measures": [], "parameters": {}, "name": "" },
      resetted: false,
      results: [],
      globalParameters: JSON.parse(localStorage.getItem("globalParameters") || JSON.stringify({})),
      subsectorMapping: JSON.parse(localStorage.getItem("subsectorMapping") || JSON.stringify({})),
      carrierMapping: JSON.parse(localStorage.getItem("carrierMapping") || JSON.stringify({})),
      monetisationFactorMapping: JSON.parse(localStorage.getItem("monetisationFactorMapping") || JSON.stringify({})),
      parameters: JSON.parse(localStorage.getItem("parameters") || JSON.stringify({})),
      useRenovationRate: String(localStorage.getItem("useRenovationRate") || "false").toLowerCase() === "true",
      seedInfo: String(localStorage.getItem("seedInfo") || "false").toLowerCase() === "true",
    }
  },
  actions: {
    updateStage(stage: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("stage", stage.toString());
    },
    updateMure(mure: boolean, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("mure", mure.toString());
    },
    updateOdyssee(odyssee: boolean, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("odyssee", odyssee.toString());
    },
    updateMureToken(mureToken: MureTokenInterface, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("mureToken", JSON.stringify(mureToken));
    },
    updateMureCategory(mureCategory: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("mureCategory", JSON.stringify(mureCategory));
    },
    updateMureCountry(mureCountry: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("mureCountry", JSON.stringify(mureCountry));
    },
    updateMureMeasurement(mureMeasurement: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("mureMeasurement", JSON.stringify(mureMeasurement));
    },
    updateOdysseeStartYear(odysseeStartYear: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("odysseeStartYear", JSON.stringify(odysseeStartYear));
    },
    updateOdysseeEndYear(odysseeEndYear: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("odysseeEndYear", JSON.stringify(odysseeEndYear));
    },
    updateRegion(region: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("region", region.toString());
    },
    updateMunicipality(municipality: boolean, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("municipality", municipality.toString());
    },
    updateInhabitants(inhabitants: number, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("inhabitants", inhabitants.toString());
    },
    updateYears(years: Array<number>, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("years", JSON.stringify(years));
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
    updateSubsectorMapping(subsectorMapping: { [key: number]: string }, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("subsectorMapping", JSON.stringify(subsectorMapping));
    },
    updateCarrierMapping(carrierMapping: CarrierMapping, manualChange?: boolean) {
      if (manualChange) this.resetted = false;
      localStorage.setItem("carrierMapping", JSON.stringify(carrierMapping));
    },
    updateMonetisationFactorMapping(monetisationFactorMapping: { [key: number]: string }, manualChange?: boolean) {
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
      this.updateMure(false, false);
      this.updateOdyssee(false, false);
      this.updateMureCategory(0, false);
      this.updateMureCountry(0, false);
      this.updateMureMeasurement(0, false);
      this.updateOdysseeStartYear(2000, false);
      this.updateOdysseeEndYear(2022, false);
      this.updateRegion(0, false);
      this.updateMunicipality(false, false);
      this.updateInhabitants(100000, false);
      this.updateYears(getYears(), false);
      this.updatePrograms([structuredClone(defaultProgram)], false);
      this.updatePayload({ "measures": [], "parameters": {}, "name": "" }, false);
      this.updateParameters({}, false);
      this.updateGlobalParameters({}, false);
      this.updateSubsectorMapping({}, false);
      this.updateCarrierMapping({}, false);
      this.updateMonetisationFactorMapping({}, false);
      this.updateUseRenovationRate(false, false);
    },
  },
});
