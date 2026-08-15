export type ValuationInput = {
  make: string;
  model: string;
  trim: string;
  year: number;
  mileage: number;
  askingPrice: number;
  zip: string;
  radius: number;
  condition: "new" | "used";
  accidentCount?: number;
};

export type ValuationResult = {
  fairValue: number;
  lowRange: number;
  highRange: number;
  targetPrice: number;
  dealScore: number;
  verdict: "Great price" | "Good price" | "Fair price" | "High price";
  confidence: number;
  savingsVsMarket: number;
  factors: Array<{ label: string; impact: number }>;
};

const msrpByModel: Record<string, number> = {
  "toyota rav4": 31_900,
  "honda cr-v": 32_350,
  "mazda cx-5": 30_650,
  "subaru forester": 31_250,
};

const trimAdjustment: Record<string, number> = {
  le: -1_450,
  xle: 900,
  touring: 3_400,
  premium: 2_150,
  sport: 1_750,
};

const roundToTen = (value: number) => Math.round(value / 10) * 10;
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function scoreValuation(input: ValuationInput): ValuationResult {
  const key = `${input.make} ${input.model}`.toLowerCase();
  const msrp = msrpByModel[key] ?? 32_000;
  const currentYear = 2026;
  const age = Math.max(0, currentYear - input.year);
  const retainedValue =
    input.condition === "new" || age === 0
      ? 0.985
      : 0.88 * Math.pow(0.94, Math.max(age - 1, 0));
  const expectedMileage = Math.max(age * 11_500, input.condition === "new" ? 50 : 8_000);
  const mileageImpact = clamp((expectedMileage - input.mileage) * 0.076, -3_800, 3_200);
  const trimImpact = trimAdjustment[input.trim.toLowerCase()] ?? 0;
  const regionalImpact = ["8", "9"].includes(input.zip.charAt(0)) ? 430 : 110;
  const historyImpact = -(input.accidentCount ?? 0) * 2_450;
  const radiusImpact = input.radius >= 100 ? -180 : 0;

  const fairValue = roundToTen(
    msrp * retainedValue +
      mileageImpact +
      trimImpact +
      regionalImpact +
      historyImpact +
      radiusImpact,
  );
  const deltaPct = ((fairValue - input.askingPrice) / fairValue) * 100;
  const dealScore = Math.round(clamp(72 + deltaPct * 2.35, 28, 96));
  const verdict =
    deltaPct >= 4
      ? "Great price"
      : deltaPct >= 0
        ? "Good price"
        : deltaPct >= -5
          ? "Fair price"
          : "High price";
  const confidence = Math.round(
    clamp(94 - Math.abs(input.mileage - expectedMileage) / 5_500, 76, 94),
  );

  return {
    fairValue,
    lowRange: roundToTen(fairValue * 0.945),
    highRange: roundToTen(fairValue * 1.062),
    targetPrice: roundToTen(Math.min(fairValue * 0.965, input.askingPrice * 0.982)),
    dealScore,
    verdict,
    confidence,
    savingsVsMarket: roundToTen(fairValue - input.askingPrice),
    factors: [
      { label: "Mileage vs. local comps", impact: roundToTen(mileageImpact) },
      { label: "Trim and equipment", impact: roundToTen(trimImpact) },
      { label: "Denver market demand", impact: regionalImpact },
      { label: "Reported history", impact: historyImpact },
    ],
  };
}
