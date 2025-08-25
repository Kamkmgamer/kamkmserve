import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import OrderActions from "~/app/admin/orders/[id]/order-actions";
import { db } from "~/server/db";
import { coupons, orderLineItems, orders, referrals, services, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getOrder(id: string) {
  // Load the order header/details
  const [orderRow] = await db
    .select({
      id: orders.id,
      userEmail: users.email,
      totalAmount: orders.totalAmount,
      status: orders.status,
      couponCode: coupons.code,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      requirements: orders.requirements,
      suggestions: orders.suggestions,
      preferences: orders.preferences,
      questions: orders.questions,
      currency: orders.currency,
      referralCode: referrals.code,
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))
    .leftJoin(coupons, eq(coupons.id, orders.couponId))
    .leftJoin(referrals, eq(referrals.id, orders.referralId))
    .where(eq(orders.id, id))
    .limit(1);

  if (!orderRow) return null;

  // Load line items
  const items = await db
    .select({
      id: orderLineItems.id,
      serviceId: orderLineItems.serviceId,
      serviceName: services.name,
      unitPrice: orderLineItems.unitPrice,
      quantity: orderLineItems.quantity,
      totalPrice: orderLineItems.totalPrice,
    })
    .from(orderLineItems)
    .leftJoin(services, eq(services.id, orderLineItems.serviceId))
    .where(eq(orderLineItems.orderId, id));

  return {
    id: orderRow.id,
    userEmail: orderRow.userEmail ?? "—",
    totalAmount: orderRow.totalAmount,
    status: orderRow.status,
    couponCode: orderRow.couponCode ?? null,
    createdAt: orderRow.createdAt instanceof Date ? orderRow.createdAt.toISOString() : String(orderRow.createdAt),
    updatedAt: orderRow.updatedAt instanceof Date ? orderRow.updatedAt.toISOString() : String(orderRow.updatedAt),
    requirements: orderRow.requirements,
    suggestions: orderRow.suggestions ?? null,
    preferences: orderRow.preferences ?? null,
    questions: orderRow.questions ?? null,
    currency: orderRow.currency,
    referralCode: orderRow.referralCode ?? null,
    lineItems: items.map((li) => ({
      id: li.id,
      serviceId: li.serviceId,
      serviceName: li.serviceName ?? "—",
      unitPrice: li.unitPrice,
      quantity: li.quantity,
      totalPrice: li.totalPrice,
    })),
  };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return notFound();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
        <OrderActions id={order.id} initialStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Summary</h2>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div><span className="text-muted-foreground">User:</span> {order.userEmail}</div>
            <div><span className="text-muted-foreground">Status:</span> {order.status}</div>
            <div><span className="text-muted-foreground">Total:</span> {order.currency} ${order.totalAmount}</div>
            <div><span className="text-muted-foreground">Coupon:</span> {order.couponCode ?? "—"}</div>
            <div><span className="text-muted-foreground">Referral:</span> {order.referralCode ?? "—"}</div>
            <div><span className="text-muted-foreground">Created:</span> {new Date(order.createdAt).toLocaleString()}</div>
            <div><span className="text-muted-foreground">Updated:</span> {new Date(order.updatedAt).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="font-semibold">Line Items</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Service</TH>
                    <TH>Unit</TH>
                    <TH>Qty</TH>
                    <TH>Total</TH>
                  </TR>
                </THead>
                <TBody>
                  {order.lineItems.map((li) => (
                    <TR key={li.id}>
                      <TD>{li.serviceName}</TD>
                      <TD>${li.unitPrice}</TD>
                      <TD>{li.quantity}</TD>
                      <TD>${li.totalPrice}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <h2 className="font-semibold">Requirements</h2>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{order.requirements}</pre>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <h2 className="font-semibold">Suggestions</h2>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{order.suggestions ?? "—"}</pre>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <h2 className="font-semibold">Preferences / Questions</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm font-medium mb-1">Preferences</div>
              <pre className="whitespace-pre-wrap text-sm">{order.preferences ?? "—"}</pre>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Questions</div>
              <pre className="whitespace-pre-wrap text-sm">{order.questions ?? "—"}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
