import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  return (
    <Layout>
      <SEO 
        title="Terms of Service"
        description="Read the terms and conditions for using VibeLink Events's digital invitation services, including pricing, payments, and delivery policies."
        canonical="/terms-of-service"
        noindex={true}
      />
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Service Description</h2>
            <p className="text-muted-foreground">
              VibeLink Events provides digital invitation design and hosting services for various events including weddings, funerals, naming ceremonies, graduations, birthdays, and corporate events. Our services include custom design, hosting, and various add-on features as specified in our packages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Pricing and Payment Terms</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Standard Payment:</strong> 50% deposit required to begin work, balance due upon delivery</li>
              <li><strong>Rush Projects:</strong> 100% payment upfront required</li>
              <li><strong>Churches (established relationships):</strong> Net 7 payment terms available</li>
              <li><strong>Corporate Clients:</strong> Invoicing available with payment within 14-30 days</li>
              <li>All prices are in Ghana Cedis (GHS) unless otherwise stated</li>
              <li>Payments can be made via Mobile Money (MoMo), bank transfer, or other approved methods</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Revision Policy</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Starter Vibe:</strong> 1 round of revisions included</li>
              <li><strong>Classic Vibe:</strong> 2 rounds of revisions included</li>
              <li><strong>Prestige & Royal Vibe:</strong> Unlimited revisions included</li>
              <li>Additional revision rounds can be purchased at GHS 100 per round</li>
              <li>A revision round includes all changes requested within a single feedback session</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Delivery Timelines</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Standard Delivery:</strong> 5-7 business days from deposit and content receipt</li>
              <li><strong>Rush Delivery:</strong> 48 hours (additional fee applies)</li>
              <li>Timelines begin after we receive both payment and all required content</li>
              <li>Delays in client feedback may extend the delivery timeline</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Final designs are owned by the client after full payment</li>
              <li>VibeLink Events retains the right to use designs in our portfolio (unless white-label package is purchased)</li>
              <li>Pre-designed templates remain the property of VibeLink Events</li>
              <li>Client-provided images, logos, and content remain the property of the client</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              VibeLink Events shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability shall not exceed the amount paid for the specific service in question. We are not responsible for third-party service interruptions affecting hosting or delivery.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Client Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate event information and content</li>
              <li>Ensure you have rights to any images or content provided</li>
              <li>Review designs promptly and provide clear feedback</li>
              <li>Verify all details before final approval</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Special Terms</h2>
            <div className="bg-muted/30 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Discount Guidelines</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>10% discount:</strong> Churches and funeral homes (partnership building)</li>
                <li><strong>15% discount:</strong> Bulk bookings (3+ events from same client/organization)</li>
                <li><strong>20% discount:</strong> Event planners (5+ referrals/year)</li>
                <li><strong>50% or complimentary:</strong> High-profile clients for testimonial/case study value (at our discretion)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, please contact us at:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>Email:</strong> hello@vibelinkgh.com</li>
              <li><strong>WhatsApp:</strong> +233 24 581 7973</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
