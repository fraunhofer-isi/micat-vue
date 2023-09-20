import { defineStore } from "pinia";
import {defaultProgram, stages} from '@/defaults';
import type { ProgramInterface, ISessionState } from "@/types";

const currentYear = Math.floor(new Date().getFullYear() / 5) * 5;

export const useSessionStore = defineStore({
  id: "session",
  state: (): ISessionState => {
    return {
      currentYear: parseInt(localStorage.getItem("currentYear") || currentYear.toString()),
      stage: parseInt(localStorage.getItem("stage") || stages.home.toString()),
      future: String(localStorage.getItem("future") || "false").toLowerCase() === "true",
      region: parseInt(localStorage.getItem("region") || "0"),
      municipality: String(localStorage.getItem("municipality") || "false").toLowerCase() === "true",
      unit: parseInt(localStorage.getItem("unit") || "1"),
      inhabitants: parseInt(localStorage.getItem("inhabitants") || "100000"),
      years: JSON.parse(localStorage.getItem("years") || JSON.stringify([currentYear - 10, currentYear - 5, currentYear])),
      programs: JSON.parse(localStorage.getItem("programs") || JSON.stringify([structuredClone(defaultProgram)])),
    }
  },
  actions: {
    updateStage(stage: number) {
      localStorage.setItem("stage", stage.toString());
    },
    updateFuture(future: boolean) {
      localStorage.setItem("future", future.toString());
    },
    updateRegion(region: number) {
      localStorage.setItem("region", region.toString());
    },
    updateMunicipality(municipality: boolean) {
      localStorage.setItem("municipality", municipality.toString());
    },
    updateUnit(unit: number) {
      localStorage.setItem("unit", unit.toString());
    },
    updateInhabitants(inhabitants: number) {
      localStorage.setItem("inhabitants", inhabitants.toString());
    },
    updateYears(years: Array<number>) {
      localStorage.setItem("years", JSON.stringify(years));
    },
    updatePrograms(programs: Array<ProgramInterface>) {
      localStorage.setItem("programs", JSON.stringify(programs));
    },
    reset() {
      this.updateStage(stages.home);
      this.updateFuture(false);
      this.updateRegion(0);
      this.updateMunicipality(false);
      this.updateUnit(1);
      this.updateInhabitants(100000);
      this.updateYears([currentYear - 10, currentYear - 5, currentYear]);
      this.updatePrograms([structuredClone(defaultProgram)]);
    },
  },
});
