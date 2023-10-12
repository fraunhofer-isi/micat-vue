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

export interface PayloadParameterEntryInterface {
    [key: string]: number;
}
export interface PayloadParameterInterface {
    [key: string]: Array<PayloadParameterEntryInterface>;
}
export interface PayloadSavingParameterInterface {
    [key: string]: number;
}
export interface PayloadSavingDetailsInterface {
    [key: string]: Array<PayloadSavingParameterInterface>;
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
export interface DataInterface {
    [key: string]: any
}
export interface DatasetInterface {
    label: string;
    data: DataInterface,
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
  payload: PayloadInterface;
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
export interface CbaResultInterface {
    title: string;
    slug: string;
}
export interface CbaData {
    years:                       string[];
    supportingYears:             number[];
    costBenefitAnalysisFacility: CostBenefitAnalysisFacility;
    netPresentValue:             NetPresentValue;
    costBenefitRatio:            CostBenefitRatio;
    levelisedCosts:              LevelisedCosts;
    marginalCostCurves:          MarginalCostCurves;
    fundingEfficiency:           FundingEfficiency;
}

export interface CostBenefitAnalysisFacility {
    newEnergySavings: NewEnergySaving[];
    newInvestments:   NewEnergySaving[];
}

export interface NewEnergySaving {
    id_measure: number;
    data: {[key: string]: number};
}

export interface CostBenefitRatio {
    costBenefitRatios: NewEnergySaving[];
    benefitCostRatios: NewEnergySaving[];
}

export interface FundingEfficiency {
    fundingEfficiencyOfEnergySavings: NewEnergySaving[];
    fundingEfficiencyOfCo2Reductions: NewEnergySaving[];
}

export interface LevelisedCosts {
    levelisedCostsOfSavedEnergies: NewEnergySaving[];
    levelisedCostsOfSavedCo2:      NewEnergySaving[];
    annuatisedCo2Emissions:        NewEnergySaving[];
}

export interface MarginalCostCurves {
    marginalEnergySavingsCostCurves: MarginalSavingsCostCurve[];
    marginalCo2SavingsCostCurves:    MarginalSavingsCostCurve[];
}

export interface MarginalSavingsCostCurve {
    id_measure: number;
    data: {[key: string]: {[key: string]: number}};
}

export interface Datum {
    x:  number;
    y: number;
}

export interface NetPresentValue {
    annuatisedEnergyCosts:     NewEnergySaving[];
    annuatisedMultipleImpacts: NewEnergySaving[];
    netPresentValues:          NewEnergySaving[];
}
export interface CbaDataInterface {
    labels: Array<string>;
    datasets: Array<DatasetInterface>;
}
export interface CbaCategoryInterface {
    title: string;
    data: CbaDataInterface;
}
export interface CbaCategoriesInterface {
    [key: string]: Array<CbaCategoryInterface>;
}
