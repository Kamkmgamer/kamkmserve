import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { payouts, referrals } from '~/server/db/schema';
import { and, desc, eq, like, or } from 'drizzle-orm';
import { z } from 'zod';

// GET: Return a list of payouts (optional search: q matches referral code or status)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const status = searchParams.get('status');

    const rows = await db
      .select({
        id: payouts.id,
        referralId: payouts.referralId,
        amount: payouts.amount,
        status: payouts.status,
        payoutDate: payouts.payoutDate,
        createdAt: payouts.createdAt,
        updatedAt: payouts.updatedAt,
        referralCode: referrals.code,
      })
      .from(payouts)
      .leftJoin(referrals, eq(referrals.id, payouts.referralId))
      .where(
        q || status
          ? and(
              status ? eq(payouts.status, status as typeof payouts.$inferSelect.status) : undefined,
              q ? or(like(referrals.code, `%${q}%`), like(payouts.status, `%${q}%`)) : undefined,
            )
          : undefined,
      )
      .orderBy(desc(payouts.createdAt));

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
