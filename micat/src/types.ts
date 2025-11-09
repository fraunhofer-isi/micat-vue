// © 2024 - 2025 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later

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

export interface SelectedImprovementInterface {
    internalId: number;
    name?: string;
    program?: string;
    subsector?: string;
    subsectorId?: number;
    startingYear?: number;
    data?: ImprovementInterface;
    unit: number;
    showParameterWarning?: boolean;
}

export interface ImprovementValueInterface {
    [key: string]: number;
}
export interface ImprovementInterface {
    id?: number;
    internalId?: number;
    name?: string;
    label?: string;
    values: ImprovementValueInterface;
    percentage?: number;
    showParameterWarning?: boolean;
}

export interface UnitInterface {
    name: string;
    symbol: string;
    factor: number;
}
export interface UnitsInterface {
    [key: number]: UnitInterface
}

export interface ProgramInterface {
    name: string;
    type: string;
    unit: number;
    unitName?: string;
    startingYear?: number;
    subsector: number;
    subsectorName: string;
    showSubsectorMenu: boolean;
    improvements: Array<ImprovementInterface>;
    mureTotal?: {
        [key: string]: number;
    };
}

export interface SubsectorInterface {
    name: string;
    id: number | string;
    renewable: boolean;
    improvements: Array<ImprovementInterface>;
}

export interface PayloadParameterEntryInterface {
    [key: string]: number | string | undefined;
    id_subsector?: number;
    Subsector?: string;
    index?: number;
    "Monetisation factor"?: string;
    Value?: number;
    id_final_energy_carrier?: number;
    id_primary_energy_carrier?: number;
    "Final energy carrier"?: string;
    "Primary energy carrier"?: string;
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
}
export interface PayloadInterface {
    measures: Array<PayloadMeasureInterface>;
    parameters: PayloadParameterInterface;
    population?: number;
    name: string;
}
export interface ResultInterface {
    title?: string;
    description?: string;
    idColumnNames: Array<string>;
    rows: Array<Array<any>>;
    yearColumnNames: Array<string>;
}
export interface ResultsInterface {
    name: string;
    data: {
        [key: string]: ResultInterface
    }
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

export interface CarrierMapping {
    [key: string]: {
        [key: number]: string
    }
}

export interface MureTokenInterface {
    token: string;
    expires: number;
}

export interface MureCategoryInterface {
    id: number;
    label: string;
}

export interface ISessionState {
    currentYear: number;
    stage: number;
    mure: boolean;
    odyssee: boolean;
    mureToken: MureTokenInterface;
    mureCategory: number;
    mureCountry: number;
    mureMeasurement: number;
    odysseeStartYear: number;
    odysseeEndYear: number;
    region: number;
    municipality: boolean;
    inhabitants: number;
    years: Array<number>;
    programs: Array<ProgramInterface>;
    payload: PayloadInterface;
    resetted: boolean;
    results: ResultsInterface[];
    globalParameters: GlobalParameters;
    subsectorMapping: { [key: number]: string };
    carrierMapping: CarrierMapping;
    monetisationFactorMapping: { [key: number]: string };
    parameters: Parameters;
    useRenovationRate: boolean;
    showRenewables: boolean;
    seedInfo: boolean;
}
export interface ISessionStateFunctions {
    updateStage: (stage: number) => void;
    updateRegion: (region: number) => void;
    updateMunicipality: (municipality: boolean) => void;
    updateInhabitants: (inhabitants: number) => void;
    updateUnit: (unit: number) => void;
    updateYears: (years: Array<number>) => void;
    updatePrograms: (programs: Array<ProgramInterface>) => void;
}
export interface CbaResultInterface {
    title: string;
    slug: "netPresentValue";
}
export interface CbaData {
    name: string;
    annualMultipleImpacts: number;
    annualEnergyCosts: number;
    netPresentValue: number;
    parameters: {
        discountRate: number;
        energyPriceSensitivity: number;
        investmentsSensitivity: number;
    };
}
export interface CbaDataOld {
    years: string[];
    supportingYears: number[];
    costBenefitAnalysisFacility: CostBenefitAnalysisFacility;
    netPresentValue: NetPresentValue;
    costBenefitRatio: CostBenefitRatio;
    levelisedCosts: LevelisedCosts;
    marginalCostCurves: MarginalCostCurves;
    fundingEfficiency: FundingEfficiency;
}

export interface CostBenefitAnalysisFacility {
    newEnergySavings: NewEnergySaving[];
    newInvestments: NewEnergySaving[];
}

export interface NewEnergySaving {
    id_measure: number;
    data: { [key: string]: number };
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
    levelisedCostsOfSavedCo2: NewEnergySaving[];
    annuatisedCo2Emissions: NewEnergySaving[];
}

export interface MarginalCostCurves {
    marginalEnergySavingsCostCurves: MarginalSavingsCostCurve[];
    marginalCo2SavingsCostCurves: MarginalSavingsCostCurve[];
}

export interface MarginalSavingsCostCurve {
    id_measure: number;
    data: { [key: string]: { [key: string]: number } };
}

export interface Datum {
    x: number;
    y: number;
}

export interface NetPresentValue {
    annuatisedEnergyCosts: NewEnergySaving[];
    annuatisedMultipleImpacts: NewEnergySaving[];
    netPresentValues: NewEnergySaving[];
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
export interface GlobalParameterValue {
    key: number;
    value: number | null;
    carrierType?: string;
}
export interface GlobalParameters {
    // Categories
    [key: string]: {
        // Subsector IDs
        [key: number]: {
            // Years / factors
            [key: string]: Array<GlobalParameterValue>;
        }
    }
}
export interface ParameterValue {
    key: string;
    value: number;
}
export interface ParameterEntry {
    years: Array<ParameterValue>;
    parameters: {
        [key: string]: string | number;
    };
    identifier: string;
}
export interface ParameterCategory {
    [key: string]: Array<ParameterEntry>
}
export interface Parameters {
    [key: number]: ParameterCategory
}

export interface MureCountryInterface {
    id: number;
    name: string;
}

export interface MureMeasurementInterface {
    id: number;
    "@id": string;
    title: string;
    startingDate: string;
}

interface MureSavingsInterface {
    year: string;
    calculatedPj: number;
    calculatedKtCO2: number;
    pj: number;
}

export interface MureMeasurementDataInterface {
    "@id": string;
    code: string;
    title: string;
    reference: string;
    targetedEndUses: Array<{
        evaluationMethod: string;
        cumulativeAnnualSavings: Array<MureSavingsInterface>;
    }>;
    "generalDescription": string;
    "interactionOfMeasures": string;
}

export interface OdysseeDataInterface {
    [key: string]: number;
}