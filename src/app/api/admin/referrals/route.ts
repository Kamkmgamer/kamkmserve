import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { referrals, users } from "~/server/db/schema";
import { desc, eq, like, or } from "drizzle-orm";

const CreateSchema = z.object({
  userId: z.string().min(1),
  code: z.string().min(3).max(64).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q"); // optional search by email or code

    const rows = await db
      .select({
        id: referrals.id,
        userId: referrals.userId,
        code: referrals.code,
        commissionRate: referrals.commissionRate,
        createdAt: referrals.createdAt,
        updatedAt: referrals.updatedAt,
        userEmail: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(users.id, referrals.userId))
      .where(q ? or(like(users.email, `%${q}%`), like(referrals.code, `%${q}%`)) : undefined)
      .orderBy(desc(referrals.createdAt));

    const data = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      userEmail: r.userEmail ?? "—",
      code: r.code,
      commissionRate: r.commissionRate,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
    }));

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list referrals" }, { status: 500 });
  }
}

function randomCode() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const code = parsed.data.code ?? randomCode();

    const [row] = await db
      .insert(referrals)
      .values({
        userId: parsed.data.userId,
        code,
        commissionRate: parsed.data.commissionRate ?? 0.1,
      })
      .returning({ id: referrals.id });

    if (!row?.id) return NextResponse.json({ error: "Failed to create referral" }, { status: 500 });

    const [full] = await db
      .select({
        id: referrals.id,
        userId: referrals.userId,
        code: referrals.code,
        commissionRate: referrals.commissionRate,
        createdAt: referrals.createdAt,
        updatedAt: referrals.updatedAt,
        userEmail: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(users.id, referrals.userId))
      .where(eq(referrals.id, row.id))
      .limit(1);

    if (!full) return NextResponse.json({ error: "Failed to load created referral" }, { status: 500 });

    const data = {
      id: full.id,
      userId: full.userId,
      userEmail: full.userEmail ?? "—",
      code: full.code,
      commissionRate: full.commissionRate,
      createdAt: full.createdAt instanceof Date ? full.createdAt.toISOString() : String(full.createdAt),
      updatedAt: full.updatedAt instanceof Date ? full.updatedAt.toISOString() : String(full.updatedAt),
    };

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 });
  }
}
