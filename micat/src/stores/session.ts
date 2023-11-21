import { defineStore } from "pinia";
import {defaultProgram, stages} from '@/defaults';
import type {ProgramInterface, ISessionState, PayloadInterface} from "@/types";

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
      globalParameters: {},
      subsectorMapping: {},
      carrierMapping: {},
      monetisationFactorMapping: {},
      parameters: {},
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
    },
  },
});
