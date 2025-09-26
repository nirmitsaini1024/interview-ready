import Header from "@/app/_components/(home)/Header";
import SiteFooter from "@/app/_components/(home)/SiteFooter";

export default function ShippingPage() {
  return (
    <>
    <Header />
        <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Shipping Policy</h1>
      <p className="mb-4">
        As Hirenom is a digital AI interview platform, no physical goods are involved. Simply create your account and start using our services immediately.
      </p>
      <p>
        For any issues with access or functionality, please contact support.
      </p>
    </main>
    <SiteFooter />
    </>
  );
}
