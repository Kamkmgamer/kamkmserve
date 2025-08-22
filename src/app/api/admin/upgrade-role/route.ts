import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// PATCH endpoint to upgrade a user's role to ADMIN
// This endpoint should be accessible only to SUPERADMIN users via middleware protection
export async function PATCH(request: Request): Promise<Response> {
  try {
    const Schema = z.object({ userId: z.string().min(1) });
    const bodyUnknown: unknown = await request.json();
    const parsed = Schema.safeParse(bodyUnknown);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await db
      .update(users)
      .set({ role: 'ADMIN' })
      .where(eq(users.clerkUserId, parsed.data.userId));

    return NextResponse.json({ message: 'User promoted to ADMIN successfully.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error upgrading role' }, { status: 500 });
  }
}
