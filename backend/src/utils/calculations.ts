export interface OEECalculation {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  totalTime: number;
  downtime: number;
  actualOutput: number;
  targetOutput: number;
  goodOutput: number;
}

export const calculateOEE = (
  plannedProductionTime: number, // minutes
  downtime: number, // minutes
  actualQuantity: number,
  goodQuantity: number,
  targetCycleTime: number // seconds
): OEECalculation => {
  // Availability = (Planned Production Time - Downtime) / Planned Production Time
  const operatingTime = plannedProductionTime - downtime;
  const availability =
    plannedProductionTime > 0
      ? (operatingTime / plannedProductionTime) * 100
      : 0;

  // Performance = (Actual Output × Ideal Cycle Time) / Operating Time
  const idealCycleTimeMinutes = targetCycleTime / 60;
  const targetOutput =
    operatingTime > 0 ? operatingTime / idealCycleTimeMinutes : 0;
  const performance =
    targetOutput > 0 ? (actualQuantity / targetOutput) * 100 : 0;

  // Quality = Good Output / Total Output
  const quality =
    actualQuantity > 0 ? (goodQuantity / actualQuantity) * 100 : 0;

  // OEE = Availability × Performance × Quality
  const oee = (availability * performance * quality) / 10000;

  return {
    oee: Math.round(oee * 100) / 100,
    availability: Math.round(availability * 100) / 100,
    performance: Math.round(performance * 100) / 100,
    quality: Math.round(quality * 100) / 100,
    totalTime: plannedProductionTime,
    downtime,
    actualOutput: actualQuantity,
    targetOutput: Math.round(targetOutput),
    goodOutput: goodQuantity,
  };
};

export const calculateMTBF = (
  totalOperatingTime: number, // hours
  numberOfFailures: number
): number => {
  return numberOfFailures > 0
    ? Math.round((totalOperatingTime / numberOfFailures) * 100) / 100
    : 0;
};

export const calculateMTTR = (
  totalDowntime: number, // minutes
  numberOfFailures: number
): number => {
  return numberOfFailures > 0
    ? Math.round((totalDowntime / numberOfFailures) * 100) / 100
    : 0;
};
