// © 2024 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later

/* eslint-disable */
// TODO: This file has been taken from the old frontend and should be revised.
class CostBenefitAnalysisTools {
  static findObjectById(dataArray, objectId) {
    const result = dataArray.find(object => {
      return object.id === objectId;
    });
    return result;
  }

  static emptyParameters(parameters) {
    if(Array.isArray(parameters)) {
      for (const parameter of parameters) {
        const emptyParameter = CostBenefitAnalysisTools._emptyParameter(parameter);
        if(emptyParameter){
          return true;
        }
      }
    } else {
      for(const parameterName of Object.keys(parameters)) {
        const parameter = parameters[parameterName];
        const emptyParameter = CostBenefitAnalysisTools._emptyParameter(parameter);
        if(emptyParameter){
          return true;
        }
      }
    }
    return false;
  }

  static _emptyParameter(parameter) {
    if(parameter === 0) {
      return false;
    } else if (!parameter) {
      return true;
    } else if (parameter.constructor === Array && parameter.length === 0) {
      return true;
    } else if (parameter.constructor === Object && Object.keys(parameter).length === 0) {
      return true;
    }
    return false;
  }
}

const _arrayOfArraysToJson = (data, header) => {
  let startSliceIndex = 0;
  if (!header) {
    header = data[0];
    startSliceIndex = 1;
  }
  const resultDataset = data.slice(startSliceIndex).map(item =>
    // eslint-disable-next-line unicorn/no-array-reduce
    item.reduce((object_, value, index) => {
      object_[header[index]] = value;
      return object_;
    }, {})
  );
  return resultDataset;
}
const _convertLifetimeParameters = (lifetimeParameters) => {
  const convertedLifetimeParameters = [];
  for (const lifetimeParameter of lifetimeParameters) {
    convertedLifetimeParameters.push({
      idMeasure: lifetimeParameter.idMeasure,
      lifetime: lifetimeParameter.data[0]
    });
  }
  return convertedLifetimeParameters;
}

const _aggregateIdMeasure = (rows, years) => {
  let legendEntries = rows.map(row => row.legendEntry);
  if (legendEntries[0] === undefined) {
    legendEntries = ['#default#'];
  }

  const aggregations = {};
  for (const legendEntry of legendEntries) {
    let rowsForLegendEntry = rows.filter(
      row => row.legendEntry === legendEntry
    );
    if (legendEntry === '#default#') {
      rowsForLegendEntry = rows;
    }
    const dataArray = rowsForLegendEntry.map(row => row.data);
    const sumOfDataArray = _elementwiseSum(dataArray);
    const aggregation = {};
    for (const [index, year] of years.entries()) {
      aggregation[year] = sumOfDataArray[index];
    }
    aggregations[legendEntry] = aggregation;
  }
  return aggregations;
}

const _elementwiseSum = (arrayOfArrays) => {
  // eslint-disable-next-line unicorn/no-array-reduce
  return arrayOfArrays.reduce((accumulator, array) => {
    return accumulator.map((sum, index) => {
      return sum + array[index];
      // eslint-disable-next-line unicorn/no-array-method-this-argument
    }, Array.from({ length: arrayOfArrays[0].length }).fill(0));
  });
}

const _indicatorResult = (aggregations, years) => {
  const legend = Object.keys(aggregations);
  const rows = [];

  for (const year of years) {
    const row = [];
    row.push(year);
    for (const legendEntry of legend) {
      const annualValue = aggregations[legendEntry][year];
      row.push(annualValue);
    }
    rows.push(row);
  }

  return {
    legend,
    rows
  };
}
const _toJson = (indicatorData) => {
  const idColumnNames = indicatorData.idColumnNames;
  const hasIdMeasure = idColumnNames.includes('id_measure');
  const hasLegend = hasIdMeasure
    ? idColumnNames.length > 1
    : idColumnNames.length > 0;

  const rows = indicatorData.rows;

  const rowObjects = rows.map(row => {
    let idMeasure;
    if (hasIdMeasure) {
      idMeasure = row.splice(0, 1)[0];
    }

    let legendEntry = 'Value';
    if (hasLegend) {
      legendEntry = row.splice(0, 1)[0];
    }
    const data = row;

    return {
      idMeasure,
      legendEntry,
      data
    };
  });
  return rowObjects;
}
const _convertCostBenefitAnalysisData = (data) => {
  const resultDataset = {};
  for (const indicatorName of Object.keys(data)) {
    const indicatorData = data[indicatorName];
    const header = [
      ...indicatorData.idColumnNames,
      ...indicatorData.yearColumnNames
    ];
    const table = _arrayOfArraysToJson(indicatorData.rows, header);
    resultDataset[indicatorName] = table;
  }
  return resultDataset;
}
export const convert = (data) => {
  const dataset = JSON.parse(JSON.stringify((data)));
  const resultDataset = {};
  for (const indicatorName of Object.keys(dataset)) {
    const indicatorData = dataset[indicatorName];
    const yearColumnNames = indicatorData.yearColumnNames;
    const rows = _toJson(indicatorData);
    let indicatorResult;
    if (indicatorName !== 'lifetime' && indicatorName !== 'subsidyRate') {
      const aggregations = _aggregateIdMeasure(rows, yearColumnNames);
      indicatorResult = _indicatorResult(aggregations, yearColumnNames);
    }
    resultDataset[indicatorName] = indicatorResult;
  }
  resultDataset.costBenefitAnalysisData = _convertCostBenefitAnalysisData(data);
  return resultDataset;
}
class ArrayTools {
  static emptyArray(arrayLength, fillValue) {
    const array = Array.apply(
      undefined,
      Array.from({ length: arrayLength })
    ).map(() => fillValue);
    return array;
  }

  static yearRange(firstYear, lastYear) {
    const years = [];
    for (let year = firstYear; year <= lastYear; year++) {
      years.push(year);
    }
    return years;
  }

  static numberOfYears(startYear, number, forward = true) {
    const years = [];
    if (forward) {
      const endYear = startYear + number;
      for (let year = startYear; year < endYear; year++) {
        years.push(year);
      }
    } else {
      const endYear = startYear - number;
      for (let year = startYear; year > endYear; year--) {
        years.unshift(year);
      }
    }
    return years;
  }

  static padArrayToLength(array, newLength, padValue, padEnd = true) {
    if (newLength <= array.length) {
      return array;
    }
    const paddedArray = ArrayTools.emptyArray(newLength, padValue);
    const deleteCount = array.length;
    if (padEnd) {
      paddedArray.splice(0, deleteCount, ...array);
    } else {
      const start = paddedArray.length - array.length;
      paddedArray.splice(start, deleteCount, ...array);
    }
    return paddedArray;
  }

  static zip(keys, values, resultObject = {}) {
    // eslint-disable-next-line array-callback-return
    keys.map((key, index) => {
      resultObject[key] = values[index];
    });
    return resultObject;
  }
}

export class Interpolation {
  static _linearInterpolateFilledValues(values, fillValue) {
    let index = 0;
    values.push(0);
    values.unshift(0);
    for (const element of values) {
      if (element === fillValue) {
        let previousIndex = index - 1;
        // while (values[previousIndex] === fillValue) {
        //   previousIndex = previousIndex - 1;
        // }
        const previousValidValue = values[previousIndex];
        previousIndex = index + 1;
        while (values[previousIndex] === fillValue) {
          previousIndex = previousIndex + 1;
        }
        const nextValidValue = values[previousIndex];
        const step =
          Math.abs(nextValidValue - previousValidValue) /
          (previousIndex - index + 1);
        values[index] =
          nextValidValue > previousValidValue
            ? values[index - 1] + step
            : values[index - 1] - step;
      }
      index = index + 1;
    }
    values.pop();
    values.shift();
    return values;
  }

  static annualLinearInterpolation(
    objectWithAnnualData,
    returnOnlyAnnualData = false
  ) {
    const annualData = ObjectTools.annualKeysAndValues(objectWithAnnualData);
    const years = Object.keys(annualData).map(year => Number.parseInt(year));
    const values = Object.values(annualData);
    const interpolatedYears = ArrayTools.yearRange(
      years[0],
      years.at(-1)
    );
    let interpolatedValues = ArrayTools.emptyArray(interpolatedYears.length);
    for (const year of years) {
      const yearIndex = years.indexOf(year);
      const yearIndexInterpolation = interpolatedYears.indexOf(year);
      interpolatedValues[yearIndexInterpolation] = values[yearIndex];
    }
    interpolatedValues =
      Interpolation._linearInterpolateFilledValues(interpolatedValues);
    const interpolatedData = returnOnlyAnnualData
      ? ArrayTools.zip(interpolatedYears, interpolatedValues, {})
      : ArrayTools.zip(
        interpolatedYears,
        interpolatedValues,
        objectWithAnnualData
      );
    return interpolatedData;
  }
}

export class DataStructures {
  static prepareResultDataStructure() {
    const dataStructure = {
      years: [],
      supportingYears: [],
      costBenefitAnalysisFacility: {
        newEnergySavings: [],
        newInvestments: []
      },
      netPresentValue: {
        annuatisedEnergyCosts: [],
        annuatisedMultipleImpacts: [],
        netPresentValues: []
      },
      costBenefitRatio: {
        costBenefitRatios: [],
        benefitCostRatios: []
      },
      levelisedCosts: {
        levelisedCostsOfSavedEnergies: [],
        levelisedCostsOfSavedCo2: [],
        annuatisedCo2Emissions: []
      },
      marginalCostCurves: {
        marginalEnergySavingsCostCurves: [],
        marginalCo2SavingsCostCurves: []
      },
      fundingEfficiency: {
        fundingEfficiencyOfEnergySavings: [],
        fundingEfficiencyOfCo2Reductions: []
      }
    };
    return dataStructure;
  }

  static prepareMeasureSpecificResultsDataStructure(measureId) {
    const dataStructure = {
      costBenefitAnalysisFacility: {
        newEnergySavings:
          DataStructures._prepareCalculationResultDataStructure(measureId),
        newInvestments:
          DataStructures._prepareCalculationResultDataStructure(measureId)
      },
      netPresentValue: {
        annuatisedEnergyCosts:
          DataStructures._prepareCalculationResultDataStructure(measureId),
        annuatisedMultipleImpacts:
          DataStructures._prepareCalculationResultDataStructure(measureId),
        netPresentValues:
          DataStructures._prepareCalculationResultDataStructure(measureId)
      },
      costBenefitRatio: {
        costBenefitRatios:
          DataStructures._prepareCalculationResultDataStructure(measureId),
        benefitCostRatios:
          DataStructures._prepareCalculationResultDataStructure(measureId)
      },
      levelisedCosts: {
        levelisedCostsOfSavedEnergies:
          DataStructures._prepareCalculationResultDataStructure(measureId),
        levelisedCostsOfSavedCo2:
          DataStructures._prepareCalculationResultDataStructure(measureId),
        annuatisedCo2Emissions:
          DataStructures._prepareCalculationResultDataStructure(measureId)
      },
      marginalCostCurves: {
        marginalEnergySavingsCostCurves:
          DataStructures._prepareCalculationResultDataStructure(measureId),
        marginalCo2SavingsCostCurves:
          DataStructures._prepareCalculationResultDataStructure(measureId)
      },
      fundingEfficiency: {
        fundingEfficiencyOfEnergySavings:
          DataStructures._prepareCalculationResultDataStructure(measureId),
        fundingEfficiencyOfCo2Reductions:
          DataStructures._prepareCalculationResultDataStructure(measureId)
      }
    };
    return dataStructure;
  }

  static _prepareCalculationResultDataStructure(measureId) {
    const dataStructure = {
      id_measure: measureId,
      data: {}
    };
    return dataStructure;
  }

  static appendMeasureSpecificResults(measureSpecificResults, results) {
    results.costBenefitAnalysisFacility.newEnergySavings.push(
      measureSpecificResults.costBenefitAnalysisFacility.newEnergySavings
    );
    results.costBenefitAnalysisFacility.newInvestments.push(
      measureSpecificResults.costBenefitAnalysisFacility.newInvestments
    );
    results.netPresentValue.annuatisedEnergyCosts.push(
      measureSpecificResults.netPresentValue.annuatisedEnergyCosts
    );
    results.netPresentValue.annuatisedMultipleImpacts.push(
      measureSpecificResults.netPresentValue.annuatisedMultipleImpacts
    );
    results.netPresentValue.netPresentValues.push(
      measureSpecificResults.netPresentValue.netPresentValues
    );
    results.costBenefitRatio.costBenefitRatios.push(
      measureSpecificResults.costBenefitRatio.costBenefitRatios
    );
    results.costBenefitRatio.benefitCostRatios.push(
      measureSpecificResults.costBenefitRatio.benefitCostRatios
    );
    results.levelisedCosts.levelisedCostsOfSavedEnergies.push(
      measureSpecificResults.levelisedCosts.levelisedCostsOfSavedEnergies
    );
    results.levelisedCosts.levelisedCostsOfSavedCo2.push(
      measureSpecificResults.levelisedCosts.levelisedCostsOfSavedCo2
    );
    results.levelisedCosts.annuatisedCo2Emissions.push(
      measureSpecificResults.levelisedCosts.annuatisedCo2Emissions
    );
    results.marginalCostCurves.marginalEnergySavingsCostCurves.push(
      measureSpecificResults.marginalCostCurves.marginalEnergySavingsCostCurves
    );
    results.marginalCostCurves.marginalCo2SavingsCostCurves.push(
      measureSpecificResults.marginalCostCurves.marginalCo2SavingsCostCurves
    );
    results.fundingEfficiency.fundingEfficiencyOfEnergySavings.push(
      measureSpecificResults.fundingEfficiency.fundingEfficiencyOfEnergySavings
    );
    results.fundingEfficiency.fundingEfficiencyOfCo2Reductions.push(
      measureSpecificResults.fundingEfficiency.fundingEfficiencyOfCo2Reductions
    );
  }
}

export class ObjectTools {
  static annualKeysAndValues(objectWithAnnualData) {
    const annualData = Object.keys(objectWithAnnualData)
      .filter(key => {
        return Number.isInteger(Number.parseInt(key));
      })
      .sort()
      // eslint-disable-next-line unicorn/no-array-reduce
      .reduce((resultObject, year) => {
        return Object.assign(resultObject, {
          [year]: objectWithAnnualData[year]
        });
      }, {});
    return annualData;
  }

  static zipKeysAndValues(object_) {
    const zipped = [];
    for (const key of Object.keys(object_)) {
      zipped.push([key, object_[key]]);
    }
    return zipped;
  }

  static hasAllKeys(listOfKeys, object_) {
    // eslint-disable-next-line no-prototype-builtins
    const keysContained = listOfKeys.every(item => object_.hasOwnProperty(item));
    return keysContained;
  }
}

export class Parameters {
  static measureSpecificParameters(measure, indicatorData, userOptions) {
    const lifetimeParameters = indicatorData.costBenefitAnalysisData.lifetime;
    const lifetime = Parameters.lifetimeForMeasure(
      lifetimeParameters,
      measure.id
    );

    let subsidyRate = indicatorData.costBenefitAnalysisData.subsidyRate[0];
    subsidyRate = ObjectTools.annualKeysAndValues(subsidyRate);

    const reductionOfEnergyCost = Parameters._aggregateAndInterpolateParameters(
      indicatorData.costBenefitAnalysisData.reductionOfEnergyCost,
      'reductionOfEnergyCost'
    );
    const reductionOfEnergyCostForMeasure = Parameters.annualValuesForMeasure(
      reductionOfEnergyCost,
      measure.id,
      'reductionOfEnergyCost'
    );

    const reductionOfMortalityMorbidityMonetization =
      Parameters._aggregateAndInterpolateParameters(
        indicatorData.costBenefitAnalysisData
          .reductionOfMortalityMorbidityMonetization,
        'reductionOfMortalityMorbidityMonetization'
      );
    const reductionOfMortalityMorbidityMonetizationForMeasure =
      Parameters.annualValuesForMeasure(
        reductionOfMortalityMorbidityMonetization,
        measure.id,
        'reductionOfMortalityMorbidityMonetization'
      );

    const reductionOfLostWorkDaysMonetization =
      Parameters._aggregateAndInterpolateParameters(
        indicatorData.costBenefitAnalysisData
          .reductionOfLostWorkDaysMonetization,
        'reductionOfLostWorkDaysMonetization'
      );
    const reductionOfLostWorkDaysMonetizationForMeasure =
      Parameters.annualValuesForMeasure(
        reductionOfLostWorkDaysMonetization,
        measure.id,
        'reductionOfLostWorkDaysMonetization'
      );

    const reductionOfGreenHouseGasEmissionMonetization =
      Parameters._aggregateAndInterpolateParameters(
        indicatorData.costBenefitAnalysisData
          .reductionOfGreenHouseGasEmissionMonetization,
        'reductionOfGreenHouseGasEmissionMonetization'
      );
    const reductionOfGreenHouseGasEmissionMonetizationForMeasure =
      Parameters.annualValuesForMeasure(
        reductionOfGreenHouseGasEmissionMonetization,
        measure.id,
        'reductionOfGreenHouseGasEmissionMonetization'
      );

    // eslint-disable-next-line unicorn/prevent-abbreviations
    const impactOnResTargetsMonetization =
      Parameters._aggregateAndInterpolateParameters(
        indicatorData.costBenefitAnalysisData.impactOnResTargetsMonetization,
        'impactOnResTargetsMonetization'
      );
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const impactOnResTargetsMonetizationForMeasure =
      Parameters.annualValuesForMeasure(
        impactOnResTargetsMonetization,
        measure.id,
        'impactOnResTargetsMonetization'
      );

    const reductionOfAdditionalCapacitiesInGridMonetization =
      Parameters._aggregateAndInterpolateParameters(
        indicatorData.costBenefitAnalysisData
          .reductionOfAdditionalCapacitiesInGridMonetization,
        'reductionOfAdditionalCapacitiesInGridMonetization'
      );
    const reductionOfAdditionalCapacitiesInGridMonetizationForMeasure =
      Parameters.annualValuesForMeasure(
        reductionOfAdditionalCapacitiesInGridMonetization,
        measure.id,
        'reductionOfAdditionalCapacitiesInGridMonetization'
      );

    const reductionOfAirPollution =
      Parameters._aggregateAndInterpolateParameters(
        indicatorData.costBenefitAnalysisData.reductionOfAirPollution,
        'reductionOfAirPollution'
      );
    const reductionOfAirPollutionForMeasure = Parameters.annualValuesForMeasure(
      reductionOfAirPollution,
      measure.id,
      'reductionOfAirPollution'
    );

    const reductionInDisabilityAdjustedLifeYearsMonetization =
      Parameters._aggregateAndInterpolateParameters(
        indicatorData.costBenefitAnalysisData.reductionInDisabilityAdjustedLifeYearsMonetization,
        'reductionInDisabilityAdjustedLifeYearsMonetization'
      );
    const reductionInDisabilityAdjustedLifeYearsMonetizationForMeasure = Parameters.annualValuesForMeasure(
      reductionInDisabilityAdjustedLifeYearsMonetization,
      measure.id,
      'reductionInDisabilityAdjustedLifeYearsMonetization'
    );

    const avoidedExcessColdWeatherMortalityMonetization =
      Parameters._aggregateAndInterpolateParameters(
        indicatorData.costBenefitAnalysisData.avoidedExcessColdWeatherMortalityMonetization,
        'avoidedExcessColdWeatherMortalityMonetization'
      );
    const avoidedExcessColdWeatherMortalityMonetizationForMeasure = Parameters.annualValuesForMeasure(
      avoidedExcessColdWeatherMortalityMonetization,
      measure.id,
      'avoidedExcessColdWeatherMortalityMonetization'
    );

    const monetisedMultipleImpacts = {
      reductionOfEnergyCost: reductionOfEnergyCostForMeasure,
      reductionOfMortalityMorbidityMonetization:
        reductionOfMortalityMorbidityMonetizationForMeasure,
      reductionOfLostWorkDaysMonetization:
        reductionOfLostWorkDaysMonetizationForMeasure,
      reductionOfGreenHouseGasEmissionMonetization:
        reductionOfGreenHouseGasEmissionMonetizationForMeasure,
      impactOnResTargetsMonetization: impactOnResTargetsMonetizationForMeasure,
      reductionOfAdditionalCapacitiesInGridMonetization:
        reductionOfAdditionalCapacitiesInGridMonetizationForMeasure,
      reductionOfAirPollution: reductionOfAirPollutionForMeasure,
      reductionInDisabilityAdjustedLifeYearsMonetization: reductionInDisabilityAdjustedLifeYearsMonetizationForMeasure,
      avoidedExcessColdWeatherMortalityMonetization: avoidedExcessColdWeatherMortalityMonetizationForMeasure,
    };
    Parameters._checkIfParametersAreEmpty(monetisedMultipleImpacts);
    Parameters._checkIfSelectableIndicatorsArePresent(
      monetisedMultipleImpacts,
      userOptions
    );
    const monetisedAnnualReturnsOfMultipleImpacts =
      Parameters._calculateMonetisedAnnualReturnsOfMultipleImpacts(
        measure,
        monetisedMultipleImpacts,
        userOptions
      );

    const measureSpecificParameters = {
      measure,
      lifetime,
      subsidyRate,
      reductionOfEnergyCost: reductionOfEnergyCostForMeasure,
      reductionOfAirPollution: reductionOfAirPollutionForMeasure,
      monetisedAnnualReturnsOfMultipleImpacts
    };
    Parameters._checkIfParametersAreEmpty(measureSpecificParameters);
    return measureSpecificParameters;
  }

  static _checkIfParametersAreEmpty(parameters) {
    if (CostBenefitAnalysisTools.emptyParameters(parameters)) {
      throw new Error(
        'Warning! Some of the parameters needed for cost-benefit analysis are empty. Please check:' +
          parameters
      );
    }
  }

  static annualMeasureSpecificParameters(year, measure) {
    const energySaving = measure.savings[year];
    const annualMeasureSpecificParameters = {
      year,
      energySaving
    };
    const parametersToCheck = [year, energySaving];
    Parameters._checkIfParametersAreEmpty(parametersToCheck);
    return annualMeasureSpecificParameters;
  }

  static _aggregateAndInterpolateParameters(annualData, aggregationName) {
    const aggregatedAnnualValues = Parameters._aggregateAnnualValuesPerMeasure(
      annualData,
      aggregationName
    );
    const interpolatedAnnualValues =
      IndicatorInterpolation.annualIndicatorInterpolation(
        aggregatedAnnualValues,
        aggregationName
      );
    return interpolatedAnnualValues;
  }

  static _aggregateAnnualValuesPerMeasure(annualData, aggregationName) {
    const aggregatedAnnualData = [];
    const measureIds = new Set(annualData.map(row => row.id_measure));
    for (const measureId of measureIds) {
      let dataForMeasure = annualData.filter(
        row => row.id_measure === measureId
      );
      dataForMeasure = dataForMeasure.map(row =>
        ObjectTools.annualKeysAndValues(row)
      );
      const annualAggregations = {};
      for (const year of Object.keys(dataForMeasure[0])) {
        let sum = 0;
        for (const values of dataForMeasure) {
          sum += values[year];
        }
        annualAggregations[year] = sum;
      }
      aggregatedAnnualData.push({
        id_measure: measureId,
        [aggregationName]: annualAggregations
      });
    }
    return aggregatedAnnualData;
  }

  static yearsFromSavingsData(savingsData) {
    const years = Object.keys(savingsData.measures[0].savings);
    return years;
  }

  static lifetimeForMeasure(lifetimeParameters, idMeasure) {
    const lifetime = lifetimeParameters.find(lifetime => {
      return lifetime.id_measure === idMeasure;
    });
    return lifetime.value;
  }

  static annualValuesForMeasure(
    annualValuesPerMeasure,
    idMeasure,
    parameterName
  ) {
    let annualValues;
    const filteredParameter = annualValuesPerMeasure.find(annualParameters => {
      return annualParameters.id_measure === idMeasure;
    });
    if (filteredParameter) {
      annualValues = filteredParameter[parameterName];
    }
    return annualValues;
  }

  static _calculateMonetisedAnnualReturnsOfMultipleImpacts(
    measure,
    monetisedMultipleImpacts,
    userOptions
  ) {
    const monetisedAnnualReturnsOfMultipleImpacts = {};
    const energySavings = measure.savings;
    const years = Object.keys(energySavings).sort();
    for (const year of years) {
      let annualSum = 0;
      for (const indicatorName of Object.keys(userOptions.indicators)) {
        annualSum += monetisedMultipleImpacts[indicatorName][year];
      }
      monetisedAnnualReturnsOfMultipleImpacts[year] = annualSum;
    }
    return monetisedAnnualReturnsOfMultipleImpacts;
  }

  static _checkIfSelectableIndicatorsArePresent(measureSpecificParameters, userOptions) {
    const indicatorNamesUserOptions = Object.keys(userOptions.indicators);
    const hasAllKeys = ObjectTools.hasAllKeys(
      indicatorNamesUserOptions,
      measureSpecificParameters
    );
    if (!hasAllKeys) {
      throw new Error(
        'The selectable indicators of the cost-benefit-analysis do not correspond to the monetized indicators.'
      );
    }
  }
}

export class SavingsInterpolation {
  static annualSavingsInterpolation(savingsData) {
    const interpolatedSavingsTable = JSON.parse(JSON.stringify(savingsData));
    for (const measure of interpolatedSavingsTable.measures) {
      SavingsInterpolation._interpolateMeasureSavings(measure);
    }
    return interpolatedSavingsTable;
  }

  static _interpolateMeasureSavings(measure) {
    const interpolatedSavings = Interpolation.annualLinearInterpolation(
      measure.savings,
      true
    );
    measure.savings = interpolatedSavings;
  }
}

export class IndicatorInterpolation {
  static annualIndicatorInterpolation(indicatorData, indicatorName) {
    if (!indicatorData) {
      return;
    }
    const interpolatedIndicatorData = structuredClone(indicatorData);
    for (const measureData of interpolatedIndicatorData) {
      measureData[indicatorName] =
        IndicatorInterpolation._interpolateIndicator(
          measureData[indicatorName]
        );
    }
    return interpolatedIndicatorData;
  }

  static _interpolateIndicator(indicator) {
    const interpolatedIndicator = Interpolation.annualLinearInterpolation(
      indicator,
      true
    );
    return interpolatedIndicator;
  }
}

export class CostBenefitAnalysisFacility {
  static calculateCostBenefitAnalysisFacility(
    measureSpecificParameters,
    annualMeasureSpecificParameters,
    measureSpecificResults,
    userOptions
  ) {
    const totalEnergySavingsYear =
      measureSpecificParameters.measure.savings[
        annualMeasureSpecificParameters.year
      ];
    const newEnergySaving =
      CostBenefitAnalysisFacility._calculateNewEnergySaving(
        annualMeasureSpecificParameters.year,
        totalEnergySavingsYear,
        measureSpecificResults.costBenefitAnalysisFacility.newEnergySavings
          .data,
        measureSpecificParameters.lifetime
      );
    measureSpecificResults.costBenefitAnalysisFacility.newEnergySavings.data[
      annualMeasureSpecificParameters.year
    ] = newEnergySaving;

    const newInvestment = CostBenefitAnalysisFacility._calculateNewInvestment(
      annualMeasureSpecificParameters.year,
      measureSpecificParameters.measure.savings
    );
    measureSpecificResults.costBenefitAnalysisFacility.newInvestments.data[
      annualMeasureSpecificParameters.year
    ] = newInvestment;
  }

  static _calculateNewInvestment(year, savings) {
    const totalEnergySavingYear = savings[year];
    const totalEnergySavingsPreviousYear = savings[year - 1] || 0;
    const newInvestment =
      totalEnergySavingYear - totalEnergySavingsPreviousYear;
    return newInvestment;
  }

  static _calculateNewEnergySaving(
    year,
    totalEnergySavingsYear,
    newEnergySavings,
    lifetime
  ) {
    const sumOfPriorTotalAnnualEnergySavings =
      CostBenefitAnalysisFacility._sumOfPriorTotalAnnualEnergySavings(
        newEnergySavings,
        lifetime,
        year
      );
    const newEnergySaving = +(
      totalEnergySavingsYear - sumOfPriorTotalAnnualEnergySavings
    ).toFixed(2);
    return newEnergySaving;
  }

  static _sumOfPriorTotalAnnualEnergySavings(newEnergySavings, lifetime, year) {
    let sum = 0;
    for (let runningLifetime = 1; runningLifetime < lifetime + 1; runningLifetime++) {
      const priorYear = year - runningLifetime;
      const priorEnergySaving = newEnergySavings[priorYear] || 0;
      sum += priorEnergySaving;
    }
    return sum;
  }
}
export class NetPresentValue {
  static calculateNetPresentValue(
    measureSpecificParameters,
    annualMeasureSpecificParameters,
    measureSpecificResults,
    userOptions
  ) {
    const annuatisedEnergyCost =
      NetPresentValue._calculateAnnuatisedEnergyCostsOrAnnuatisedMultipleImpacts(
        userOptions.parameters.discountRate,
        measureSpecificParameters.lifetime,
        measureSpecificParameters.reductionOfEnergyCost,
        measureSpecificParameters.measure.savings,
        measureSpecificResults.costBenefitAnalysisFacility.newEnergySavings
          .data[annualMeasureSpecificParameters.year],
        annualMeasureSpecificParameters.year,
        userOptions.parameters.energyPriceSensivity,
        userOptions.parameters.investmentsSensivity
      );
    measureSpecificResults.netPresentValue.annuatisedEnergyCosts.data[
      annualMeasureSpecificParameters.year
    ] = annuatisedEnergyCost;
    const monetisedAnnualReturnsOfMultipleImpacts =
      measureSpecificParameters.monetisedAnnualReturnsOfMultipleImpacts;
    const annuatisedMultipleImpact =
      NetPresentValue._calculateAnnuatisedEnergyCostsOrAnnuatisedMultipleImpacts(
        userOptions.parameters.discountRate,
        measureSpecificParameters.lifetime,
        monetisedAnnualReturnsOfMultipleImpacts,
        measureSpecificParameters.measure.savings,
        measureSpecificResults.costBenefitAnalysisFacility.newEnergySavings
          .data[annualMeasureSpecificParameters.year],
        annualMeasureSpecificParameters.year,
        userOptions.parameters.energyPriceSensivity,
        userOptions.parameters.investmentsSensivity
      );
    measureSpecificResults.netPresentValue.annuatisedMultipleImpacts.data[
      annualMeasureSpecificParameters.year
    ] = annuatisedMultipleImpact;
    const netPresentValue = NetPresentValue._calculateNetPresentValue(
      measureSpecificResults.costBenefitAnalysisFacility.newInvestments.data[
        annualMeasureSpecificParameters.year
      ],
      annuatisedEnergyCost,
      annuatisedMultipleImpact
    );
    measureSpecificResults.netPresentValue.netPresentValues.data[
      annualMeasureSpecificParameters.year
    ] = netPresentValue;
  }

  static _calculateNetPresentValue(
    newInvestment,
    annuatisedEnergyCosts,
    annuatisedMultipleImpacts
  ) {
    const netPresentValue =
      -newInvestment + annuatisedEnergyCosts + annuatisedMultipleImpacts;
    return netPresentValue;
  }

  static _calculateAnnuatisedEnergyCostsOrAnnuatisedMultipleImpacts(
    discountRate,
    lifetime,
    energyCostReductionsOrMonetisedAnnualReturnsOfMultipleImpacts,
    energySavings,
    newEnergySaving,
    currentYear,
    energyPriceSensivity,
    investmentsSensivity
  ) {
    let annuatisedEnergyCostsOrMultipleImpacts = 0;
    for (
      let runningLifetime = 0;
      runningLifetime < lifetime;
      runningLifetime++
    ) {
      const futureYear = Number.parseInt(currentYear) + runningLifetime;
      let totalEnergySaving;
      let energyCostReductionOrMonetisedAnnualReturn;
      const years = Object.keys(energySavings).sort();
      if (years.includes(futureYear.toString())) {
        totalEnergySaving = energySavings[futureYear];
        energyCostReductionOrMonetisedAnnualReturn =
          energyCostReductionsOrMonetisedAnnualReturnsOfMultipleImpacts[
            futureYear
          ];
      } else {
        const lastValidYear = years.at(-1);
        totalEnergySaving = energySavings[lastValidYear];
        energyCostReductionOrMonetisedAnnualReturn =
          energyCostReductionsOrMonetisedAnnualReturnsOfMultipleImpacts[
            lastValidYear
          ];
      }
      if (energyPriceSensivity) {
        energyCostReductionOrMonetisedAnnualReturn =
          energyCostReductionOrMonetisedAnnualReturn * energyPriceSensivity;
      }
      if (investmentsSensivity) {
        energyCostReductionOrMonetisedAnnualReturn =
          energyCostReductionOrMonetisedAnnualReturn * investmentsSensivity;
      }
      const divisor = Math.pow(1 + discountRate, runningLifetime);
      const annuatisedEnergyCost =
        (newEnergySaving / totalEnergySaving) *
        (energyCostReductionOrMonetisedAnnualReturn / divisor);
      annuatisedEnergyCostsOrMultipleImpacts += annuatisedEnergyCost;
    }
    return annuatisedEnergyCostsOrMultipleImpacts;
  }
}

export class CostBenefitRatio {
  static calculateCostBenefitRatio(
    measureSpecificParameters,
    annualMeasureSpecificParameters,
    measureSpecificResults,
    userOptions
  ) {
    const costBenefitRatio = CostBenefitRatio._calculateCostBenefitRatio(
      measureSpecificResults.costBenefitAnalysisFacility.newInvestments.data[
        annualMeasureSpecificParameters.year
      ],
      measureSpecificResults.netPresentValue.annuatisedEnergyCosts.data[
        annualMeasureSpecificParameters.year
      ],
      measureSpecificResults.netPresentValue.annuatisedMultipleImpacts.data[
        annualMeasureSpecificParameters.year
      ]
    );
    measureSpecificResults.costBenefitRatio.costBenefitRatios.data[
      annualMeasureSpecificParameters.year
    ] = costBenefitRatio;
    const benefitCostRatio = 1 / costBenefitRatio;
    measureSpecificResults.costBenefitRatio.benefitCostRatios.data[
      annualMeasureSpecificParameters.year
    ] = benefitCostRatio;
  }

  static _calculateCostBenefitRatio(
    newInvestment,
    annuatisedEnergyCost,
    annuatisedMultipleImpact
  ) {
    const costBenefitRatio =
      newInvestment / (annuatisedEnergyCost + annuatisedMultipleImpact);
    return costBenefitRatio;
  }
}
export class LevelisedCosts {
  static calculateLevelisedCosts(
    measureSpecificParameters,
    annualMeasureSpecificParameters,
    measureSpecificResults,
    userOptions
  ) {
    const year = annualMeasureSpecificParameters.year;

    const levelisedCostsOfSavedEnergy = LevelisedCosts._calculateLevelisedCostsOfSavedEnergy(
      measureSpecificParameters.lifetime,
      measureSpecificResults.netPresentValue.netPresentValues.data[year],
      measureSpecificResults.costBenefitAnalysisFacility.newEnergySavings.data[year]
    );
    measureSpecificResults.levelisedCosts.levelisedCostsOfSavedEnergies.data[year] = levelisedCostsOfSavedEnergy;

    const levelisedCostsOfSavedCo2Results = LevelisedCosts._calculateLevelisedCostsOfSavedCo2(
      measureSpecificParameters.lifetime,
      measureSpecificParameters.reductionOfAirPollution,
      measureSpecificResults.netPresentValue.netPresentValues.data[year],
      measureSpecificResults.costBenefitAnalysisFacility.newEnergySavings.data[year],
      measureSpecificParameters.measure.savings,
      year,
      userOptions.parameters.energyPriceSensivity,
      userOptions.parameters.investmentsSensivity
    );
    const levelisedCostsOfSavedCo2 = levelisedCostsOfSavedCo2Results.levelisedCostsOfCo2Savings;
    const annuatisedCo2Emissions = levelisedCostsOfSavedCo2Results.annuatisedCo2Emissions;
    measureSpecificResults.levelisedCosts.levelisedCostsOfSavedCo2.data[year] = levelisedCostsOfSavedCo2;
    measureSpecificResults.levelisedCosts.annuatisedCo2Emissions.data[year] = annuatisedCo2Emissions;
  }

  static _calculateLevelisedCostsOfSavedEnergy(lifetime, netPresentValue, newEnergySaving) {
    const levelisedCostOfSavedEnergy = netPresentValue / (newEnergySaving * lifetime);
    return levelisedCostOfSavedEnergy;
  }

  static _calculateLevelisedCostsOfSavedCo2(
    lifetime,
    co2Savings,
    netPresentValue,
    newEnergySaving,
    energySavings,
    currentYear,
    energyPriceSensivity,
    investmentsSensivity
  ) {
    let annuatisedCo2Emissions = 0;
    for (let runningLifetime = 0; runningLifetime < lifetime; runningLifetime++) {
      const futureYear = Number.parseInt(currentYear) + runningLifetime;
      const years = Object.keys(energySavings).sort();
      let totalEnergySaving;
      let co2Saving;
      if (years.includes(futureYear.toString())) {
        totalEnergySaving = energySavings[futureYear];
        co2Saving = co2Savings[futureYear];
      } else {
        const lastValidYear = years.at(-1);
        totalEnergySaving = energySavings[lastValidYear];
        co2Saving = co2Savings[lastValidYear];
      }
      if(energyPriceSensivity) {
        co2Saving = co2Saving * energyPriceSensivity;
      }
      if(investmentsSensivity) {
        co2Saving = co2Saving * investmentsSensivity;
      }
      const annuatisedCo2Emission = newEnergySaving / totalEnergySaving * co2Saving;
      annuatisedCo2Emissions += annuatisedCo2Emission;
    }
    let levelisedCostsOfCo2Savings = 0;
    if(annuatisedCo2Emissions !== 0) {
      levelisedCostsOfCo2Savings = -netPresentValue / annuatisedCo2Emissions;
    }
    return {
      levelisedCostsOfCo2Savings,
      annuatisedCo2Emissions
    };
  }
}

export class FundingEfficiency {
  static calculateFundingEfficiency(
    measureSpecificParameters,
    annualMeasureSpecificParameters,
    measureSpecificResults,
    userOptions
  ) {
    const year = annualMeasureSpecificParameters.year;
    const fundingEfficiencyOfEnergySavings =
      FundingEfficiency._calculateFundingEfficiencyOfEnergySavings(
        measureSpecificParameters.lifetime,
        measureSpecificResults.costBenefitAnalysisFacility.newEnergySavings
          .data[year],
        measureSpecificResults.costBenefitAnalysisFacility.newInvestments.data[
          year
        ],
        measureSpecificParameters.subsidyRate[year]
      );
    measureSpecificResults.fundingEfficiency.fundingEfficiencyOfEnergySavings.data[
      year
    ] = fundingEfficiencyOfEnergySavings;
    const fundingEfficiencyOfCo2Reductions =
      FundingEfficiency._calculateFundingEfficiencyOfCo2Reductions(
        measureSpecificResults.levelisedCosts.levelisedCostsOfSavedCo2.data[
          year
        ],
        measureSpecificResults.costBenefitAnalysisFacility.newInvestments.data[
          year
        ],
        measureSpecificParameters.subsidyRate[year]
      );
    measureSpecificResults.fundingEfficiency.fundingEfficiencyOfCo2Reductions.data[
      year
    ] = fundingEfficiencyOfCo2Reductions;
  }

  static _calculateFundingEfficiencyOfEnergySavings(
    lifetime,
    newEnergySaving,
    newInvestment,
    subsidyRate
  ) {
    const fundingEfficiencyOfEnergySavings =
      (newEnergySaving * lifetime) / (subsidyRate * newInvestment);
    return fundingEfficiencyOfEnergySavings;
  }

  static _calculateFundingEfficiencyOfCo2Reductions(
    co2Emission,
    newInvestment,
    subsidyRate
  ) {
    const fundingEfficiencyOfCo2Reductions =
      co2Emission / (subsidyRate * newInvestment);
    return fundingEfficiencyOfCo2Reductions;
  }
}

export class MarginalCostCurves {
  static calculateMarginalCostCurves(
    measureSpecificParameters,
    annualMeasureSpecificParameters,
    measureSpecificResults,
    _userOptions
  ) {
    const marginalEnergySavingsCostCurve = MarginalCostCurves._calculateMarginalEnergySavingsCostCurve(
      measureSpecificResults.levelisedCosts.levelisedCostsOfSavedEnergies.data[
        annualMeasureSpecificParameters.year
      ],
      measureSpecificResults.costBenefitAnalysisFacility.newEnergySavings.data[
        annualMeasureSpecificParameters.year
      ],
      measureSpecificParameters.lifetime
    );
    measureSpecificResults.marginalCostCurves.marginalEnergySavingsCostCurves.data[
      annualMeasureSpecificParameters.year
    ] = marginalEnergySavingsCostCurve;
    const marginalCo2SavingsCostCurve = MarginalCostCurves._calculateCo2SavingsCostCurve(
      measureSpecificResults.levelisedCosts.levelisedCostsOfSavedEnergies.data[
        annualMeasureSpecificParameters.year
      ],
      measureSpecificResults.levelisedCosts.annuatisedCo2Emissions.data[
        annualMeasureSpecificParameters.year
      ]
    );
    measureSpecificResults.marginalCostCurves.marginalCo2SavingsCostCurves.data[
      annualMeasureSpecificParameters.year
    ] = marginalCo2SavingsCostCurve;
  }

  static _calculateMarginalEnergySavingsCostCurve(
    levelisedCostsOfSavedEnergy,
    newEnergySaving,
    lifetime
  ) {
    const marginalEnergySavingsCostCurve = {
      x: newEnergySaving * lifetime,
      y: levelisedCostsOfSavedEnergy
    };
    return marginalEnergySavingsCostCurve;
  }

  static _calculateCo2SavingsCostCurve(
    levelisedCostsOfSavedEnergy,
    annuatisedCo2Emission
  ) {
    const co2SavingsCostCurve = {
      x: annuatisedCo2Emission,
      y: levelisedCostsOfSavedEnergy
    };
    return co2SavingsCostCurve;
  }
}
