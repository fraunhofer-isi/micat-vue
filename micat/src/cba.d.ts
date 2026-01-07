// © 2024 - 2026 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export function convert(data: any): {
    costBenefitAnalysisData: {};
};
export class Interpolation {
    static _linearInterpolateFilledValues(values: any, fillValue: any): any;
    static annualLinearInterpolation(objectWithAnnualData: any, returnOnlyAnnualData?: boolean): {};
}
export class DataStructures {
    static prepareResultDataStructure(): {
        years: any[];
        supportingYears: any[];
        costBenefitAnalysisFacility: {
            newEnergySavings: any[];
            newInvestments: any[];
        };
        netPresentValue: {
            annuatisedEnergyCosts: any[];
            annuatisedMultipleImpacts: any[];
            netPresentValues: any[];
        };
        costBenefitRatio: {
            costBenefitRatios: any[];
            benefitCostRatios: any[];
        };
        levelisedCosts: {
            levelisedCostsOfSavedEnergies: any[];
            levelisedCostsOfSavedCo2: any[];
            annuatisedCo2Emissions: any[];
        };
        marginalCostCurves: {
            marginalEnergySavingsCostCurves: any[];
            marginalCo2SavingsCostCurves: any[];
        };
        fundingEfficiency: {
            fundingEfficiencyOfEnergySavings: any[];
            fundingEfficiencyOfCo2Reductions: any[];
        };
    };
    static prepareMeasureSpecificResultsDataStructure(measureId: any): {
        costBenefitAnalysisFacility: {
            newEnergySavings: {
                id_measure: any;
                data: {};
            };
            newInvestments: {
                id_measure: any;
                data: {};
            };
        };
        netPresentValue: {
            annuatisedEnergyCosts: {
                id_measure: any;
                data: {};
            };
            annuatisedMultipleImpacts: {
                id_measure: any;
                data: {};
            };
            netPresentValues: {
                id_measure: any;
                data: {};
            };
        };
        costBenefitRatio: {
            costBenefitRatios: {
                id_measure: any;
                data: {};
            };
            benefitCostRatios: {
                id_measure: any;
                data: {};
            };
        };
        levelisedCosts: {
            levelisedCostsOfSavedEnergies: {
                id_measure: any;
                data: {};
            };
            levelisedCostsOfSavedCo2: {
                id_measure: any;
                data: {};
            };
            annuatisedCo2Emissions: {
                id_measure: any;
                data: {};
            };
        };
        marginalCostCurves: {
            marginalEnergySavingsCostCurves: {
                id_measure: any;
                data: {};
            };
            marginalCo2SavingsCostCurves: {
                id_measure: any;
                data: {};
            };
        };
        fundingEfficiency: {
            fundingEfficiencyOfEnergySavings: {
                id_measure: any;
                data: {};
            };
            fundingEfficiencyOfCo2Reductions: {
                id_measure: any;
                data: {};
            };
        };
    };
    static _prepareCalculationResultDataStructure(measureId: any): {
        id_measure: any;
        data: {};
    };
    static appendMeasureSpecificResults(measureSpecificResults: any, results: any): void;
}
export class ObjectTools {
    static annualKeysAndValues(objectWithAnnualData: any): {};
    static zipKeysAndValues(object_: any): any[][];
    static hasAllKeys(listOfKeys: any, object_: any): any;
}
export class Parameters {
    static measureSpecificParameters(measure: any, indicatorData: any, userOptions: any): {
        measure: any;
        lifetime: any;
        subsidyRate: any;
        reductionOfEnergyCost: any;
        reductionOfAirPollution: any;
        monetisedAnnualReturnsOfMultipleImpacts: {};
    };
    static _checkIfParametersAreEmpty(parameters: any): void;
    static annualMeasureSpecificParameters(year: any, measure: any): {
        year: any;
        energySaving: any;
    };
    static _aggregateAndInterpolateParameters(annualData: any, aggregationName: any): any;
    static _aggregateAnnualValuesPerMeasure(annualData: any, aggregationName: any): {
        [x: number]: {};
        id_measure: any;
    }[];
    static yearsFromSavingsData(savingsData: any): string[];
    static lifetimeForMeasure(lifetimeParameters: any, idMeasure: any): any;
    static annualValuesForMeasure(annualValuesPerMeasure: any, idMeasure: any, parameterName: any): any;
    static _calculateMonetisedAnnualReturnsOfMultipleImpacts(measure: any, monetisedMultipleImpacts: any, userOptions: any): {};
    static _checkIfSelectableIndicatorsArePresent(measureSpecificParameters: any, userOptions: any): void;
}
export class SavingsInterpolation {
    static annualSavingsInterpolation(savingsData: any): any;
    static _interpolateMeasureSavings(measure: any): void;
}
export class IndicatorInterpolation {
    static annualIndicatorInterpolation(indicatorData: any, indicatorName: any): any;
    static _interpolateIndicator(indicator: any): {};
}
export class CostBenefitAnalysisFacility {
    static calculateCostBenefitAnalysisFacility(measureSpecificParameters: any, annualMeasureSpecificParameters: any, measureSpecificResults: any, userOptions: any): void;
    static _calculateNewInvestment(year: any, savings: any): number;
    static _calculateNewEnergySaving(year: any, totalEnergySavingsYear: any, newEnergySavings: any, lifetime: any): number;
    static _sumOfPriorTotalAnnualEnergySavings(newEnergySavings: any, lifetime: any, year: any): number;
}
export class NetPresentValue {
    static calculateNetPresentValue(measureSpecificParameters: any, annualMeasureSpecificParameters: any, measureSpecificResults: any, userOptions: any): void;
    static _calculateNetPresentValue(newInvestment: any, annuatisedEnergyCosts: any, annuatisedMultipleImpacts: any): any;
    static _calculateAnnuatisedEnergyCostsOrAnnuatisedMultipleImpacts(discountRate: any, lifetime: any, energyCostReductionsOrMonetisedAnnualReturnsOfMultipleImpacts: any, energySavings: any, newEnergySaving: any, currentYear: any, energyPriceSensivity: any, investmentsSensivity: any): number;
}
export class CostBenefitRatio {
    static calculateCostBenefitRatio(measureSpecificParameters: any, annualMeasureSpecificParameters: any, measureSpecificResults: any, userOptions: any): void;
    static _calculateCostBenefitRatio(newInvestment: any, annuatisedEnergyCost: any, annuatisedMultipleImpact: any): number;
}
export class LevelisedCosts {
    static calculateLevelisedCosts(measureSpecificParameters: any, annualMeasureSpecificParameters: any, measureSpecificResults: any, userOptions: any): void;
    static _calculateLevelisedCostsOfSavedEnergy(lifetime: any, netPresentValue: any, newEnergySaving: any): number;
    static _calculateLevelisedCostsOfSavedCo2(lifetime: any, co2Savings: any, netPresentValue: any, newEnergySaving: any, energySavings: any, currentYear: any, energyPriceSensivity: any, investmentsSensivity: any): {
        levelisedCostsOfCo2Savings: number;
        annuatisedCo2Emissions: number;
    };
}
export class FundingEfficiency {
    static calculateFundingEfficiency(measureSpecificParameters: any, annualMeasureSpecificParameters: any, measureSpecificResults: any, userOptions: any): void;
    static _calculateFundingEfficiencyOfEnergySavings(lifetime: any, newEnergySaving: any, newInvestment: any, subsidyRate: any): number;
    static _calculateFundingEfficiencyOfCo2Reductions(co2Emission: any, newInvestment: any, subsidyRate: any): number;
}
export class MarginalCostCurves {
    static calculateMarginalCostCurves(measureSpecificParameters: any, annualMeasureSpecificParameters: any, measureSpecificResults: any, _userOptions: any): void;
    static _calculateMarginalEnergySavingsCostCurve(levelisedCostsOfSavedEnergy: any, newEnergySaving: any, lifetime: any): {
        x: number;
        y: any;
    };
    static _calculateCo2SavingsCostCurve(levelisedCostsOfSavedEnergy: any, annuatisedCo2Emission: any): {
        x: any;
        y: any;
    };
}
