import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { orders } from '~/server/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: Request): Promise<Response> {
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    let csv = 'id,userId,couponId,status,currency,totalAmount,requirements,suggestions,preferences,questions,metadata,referralId,createdAt,updatedAt\n';
    rows.forEach((row) => {
      const couponId = row.couponId || '';
      const referralId = row.referralId || '';
      const createdAt = new Date(row.createdAt).toISOString();
      const updatedAt = new Date(row.updatedAt).toISOString();
      csv += `${row.id},${row.userId},${couponId},${row.status},${row.currency},${row.totalAmount},"${row.requirements}","${row.suggestions || ''}","${row.preferences || ''}","${row.questions || ''}","${row.metadata || ''}",${referralId},${createdAt},${updatedAt}\n`;
    });
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="orders.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error exporting CSV' }, { status: 500 });
  }
}
