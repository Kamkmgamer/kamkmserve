import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { payouts } from '~/server/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: Request): Promise<Response> {
  try {
    const rows = await db.select().from(payouts).orderBy(desc(payouts.createdAt));
    let csv = 'id,referralId,amount,status,payoutDate,createdAt,updatedAt\n';
    rows.forEach((row) => {
      const payoutDate = row.payoutDate ? new Date(row.payoutDate).toISOString() : '';
      const createdAt = new Date(row.createdAt).toISOString();
      const updatedAt = new Date(row.updatedAt).toISOString();
      csv += `${row.id},${row.referralId},${row.amount},${row.status},${payoutDate},${createdAt},${updatedAt}\n`;
    });
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="payouts.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error exporting CSV' }, { status: 500 });
  }
}
