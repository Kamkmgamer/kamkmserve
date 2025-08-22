import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { payouts } from '~/server/db/schema';
import { desc } from 'drizzle-orm';
import { z } from 'zod';

// GET: Return a list of payouts
export async function GET(request: Request) {
  try {
    const rows = await db.select().from(payouts).orderBy(desc(payouts.createdAt));
    return NextResponse.json({ data: rows });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error fetching payouts' }, { status: 500 });
  }
}

// POST: Create a new payout
export async function POST(request: Request) {
  try {
    const CreateSchema = z.object({
      referralId: z.string().min(1),
      amount: z.number(),
      status: z.enum(['PENDING','PAID','FAILED','UNPAID']),
      payoutDate: z.string().datetime().optional(),
    });
    const bodyUnknown: unknown = await request.json();
    const parsed = CreateSchema.safeParse(bodyUnknown);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    const [result] = await db.insert(payouts).values({
      referralId: data.referralId,
      amount: data.amount,
      status: data.status,
      payoutDate: data.payoutDate ? new Date(data.payoutDate) : undefined,
    }).returning();

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error creating payout' }, { status: 500 });
  }
}
