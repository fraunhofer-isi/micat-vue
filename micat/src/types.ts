import type {DebuggerEvent, DebuggerEventExtraInfo} from "vue";

export interface HelpTextInterface {
    [key: string]: {
        title: string;
        text: string;
        type: string;
    }
}
export interface ModalInjectInterface {
    showModal: boolean;
    modalTitle: string;
    modalText: string;
    modalType: string;
    openModal(key: string): any;
    closeModal(): any;
}
export interface StageInjectInterface {
    stage: number;
    stages: { [key: string]: number }
}

export interface ImprovementValueInterface {
    [key: string]: number;
}
export interface ImprovementInterface {
    id: number;
    name?: string;
    values: ImprovementValueInterface;
}

export interface UnitInterface {
    [key: number]: {
        name: string;
        factor: number;
    }
}

export interface ProgramInterface {
    name: string;
    subsector: number;
    improvements: Array<ImprovementInterface>;
}

export interface SubsectorInterface {
    name: number | string;
    id: number | string;
    improvements: Array<ImprovementInterface>;
}

export interface PayloadParameterInterface {
    [key: string]: number;
}
export interface PayloadSavingDetailsInterface {
    [key: string]: Array<PayloadParameterInterface>;
}
export interface PayloadSavingsInterface {
    [key: string]: number | PayloadSavingDetailsInterface;
}
export interface PayloadMeasureInterface {
    id: number;
    savings: PayloadSavingsInterface;
    parameters: PayloadParameterInterface;
}
export interface PayloadInterface {
    measures: Array<PayloadMeasureInterface>;
    parameters: PayloadParameterInterface;
    population?: number;
}
export interface ResultInterface {
    title?: string;
    description?: string;
    idColumnNames: Array<string>;
    rows: Array<Array<any>>;
    yearColumnNames: Array<string>;
}
export interface ResultsInterface {
    [key: string]: ResultInterface
}
export interface MeasurementInterface {
    [key: string]: string;
}
export interface CategoryInterface {
    icon: string;
    title: string;
    subtitle: string;
    measurements: Array<MeasurementInterface>;
    subcategories: Array<string>;
}
export interface CategoriesInterface {
    [key: string]: CategoryInterface
}
export interface DatasetInterface {
    label: string;
    data: Array<any>,
    borderColor: string;
    backgroundColor: string;
    stack?: string;
}

export interface ISessionState {
  currentYear: number;
  stage: number;
  future: boolean;
  region: number;
  municipality: boolean;
  unit: number;
  inhabitants: number;
  years: Array<number>;
  programs: Array<ProgramInterface>;
}
export interface ISessionStateFunctions {
    updateStage: (stage: number) => void;
    updateFuture: (future: boolean) => void;
    updateRegion: (region: number) => void;
    updateMunicipality: (municipality: boolean) => void;
    updateInhabitants: (inhabitants: number) => void;
    updateUnit: (unit: number) => void;
    updateYears: (years: Array<number>) => void;
    updatePrograms: (programs: Array<ProgramInterface>) => void;
}
