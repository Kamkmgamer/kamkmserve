import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function AdminHome() {
  // Dummy stats; in a real app these would be fetched from an API
  const stats = [
    { title: "Total Orders", value: "150" },
    { title: "Revenue", value: "$5000" },
    { title: "Active Referrals", value: "12" },
    { title: "Pending Payouts", value: "3" },
  ];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Use the sidebar to manage Services, Blogs, Coupons, Orders, Referrals and Payouts.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-4">
            <CardHeader>
              <h3 className="text-lg font-bold">{stat.title}</h3>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stat.value}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
