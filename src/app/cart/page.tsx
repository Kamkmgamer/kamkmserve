import Container from "~/components/layout/Container";
import CartClient from "./CartClient";

export const metadata = {
  title: "Your Cart | Kamkmserve",
};

export default function CartPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 py-10">
      <Container>
        <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">Your Cart</h1>
        <CartClient />
      </Container>
    </div>
  );
}
