import { z } from "zod";
import { scoreValuation } from "../../../lib/market-engine";

const valuationSchema = z.object({
  make: z.string().trim().min(1).max(40),
  model: z.string().trim().min(1).max(40),
  trim: z.string().trim().min(1).max(40),
  year: z.number().int().min(1990).max(2027),
  mileage: z.number().int().min(0).max(500_000),
  askingPrice: z.number().positive().max(500_000),
  zip: z.string().regex(/^\d{5}$/),
  radius: z.number().int().min(10).max(500),
  condition: z.enum(["new", "used"]),
  accidentCount: z.number().int().min(0).max(10).optional(),
});

export async function POST(request: Request) {
  const parsed = valuationSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: "Please check the vehicle and location details.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  return Response.json({
    valuation: scoreValuation(parsed.data),
    methodology: "Comparable-market baseline adjusted for age, mileage, trim, region, and reported history.",
    generatedAt: new Date().toISOString(),
  });
}
