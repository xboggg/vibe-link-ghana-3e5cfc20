import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <SEO 
        title="Privacy Policy"
        description="Learn how VibeLink Ghana collects, uses, and protects your personal information when you use our digital invitation services."
        canonical="/privacy-policy"
        noindex={true}
      />
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">When you use VibeLink Ghana's services, we collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Personal Information:</strong> Name, email address, phone number, WhatsApp number</li>
              <li><strong>Event Details:</strong> Event type, date, venue, names of celebrants</li>
              <li><strong>Design Preferences:</strong> Color choices, style preferences, reference images</li>
              <li><strong>Payment Information:</strong> Transaction details (processed securely by our payment providers)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Create and deliver your digital invitations</li>
              <li>Contact you about your order status and design revisions</li>
              <li>Process payments and send receipts</li>
              <li>Improve our services and customer experience</li>
              <li>Send promotional offers (only with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell or rent your personal information to third parties. We may share information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Payment processors:</strong> To process your transactions securely</li>
              <li><strong>Hosting providers:</strong> To host your digital invitations</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as your invitation is active, plus an additional 12 months for customer support purposes. Design files and reference images are deleted 6 months after project completion unless you request otherwise.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights (GDPR Compliance)</h2>
            <p className="text-muted-foreground mb-4">If you are in the EU or visiting from the diaspora, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              For any privacy-related inquiries or to exercise your rights, please contact us at:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>Email:</strong> privacy@vibelinkgh.com</li>
              <li><strong>WhatsApp:</strong> +233 24 581 7973</li>
              <li><strong>Address:</strong> Accra, Ghana</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
