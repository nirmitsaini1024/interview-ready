import Header from "@/app/_components/(home)/Header";
import SiteFooter from "@/app/_components/(home)/SiteFooter";

export default function CancellationRefundPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">
            Cancellation & Refund Policy
          </h1>

          <p className="text-gray-700 mb-4">
            At <strong>Hirenom</strong>, we strive to offer transparent and fair policies for all our users. Please review our cancellation and refund terms below.
          </p>

          <div className="space-y-4 text-gray-800 text-base">
            <p>
              🔒 <strong>Service Availability:</strong> Our AI interview platform is available 24/7. Any service interruptions will be addressed promptly.
            </p>
            <p>
              💳 <strong>Account Management:</strong> Users can access and manage their accounts through the dashboard. For any account-related issues, please contact support.
            </p>
            <p>
              Our team is committed to providing excellent support for all users.
            </p>
            <p>
              📧 For support, contact us at <a href="mailto:gkmbusiness74@gmail.com" className="text-blue-600 underline">gkmbusiness74@gmail.com</a>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
