import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "~/components/ui/table";
import OrderActions from "~/app/admin/orders/[id]/order-actions";

export const dynamic = "force-dynamic";

async function getOrder(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/orders/${id}`, {
    // Make sure this works both on server and client during SSR
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    data?: {
      id: string;
      userEmail: string;
      totalAmount: number;
      status: string;
      couponCode: string | null;
      createdAt: string;
      updatedAt: string;
      requirements: string;
      suggestions: string | null;
      preferences: string | null;
      questions: string | null;
      currency: string;
      referralCode: string | null;
      lineItems: Array<{
        id: string;
        serviceId: string;
        serviceName: string;
        unitPrice: number;
        quantity: number;
        totalPrice: number;
      }>;
    };
  };
  return json.data ?? null;
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
