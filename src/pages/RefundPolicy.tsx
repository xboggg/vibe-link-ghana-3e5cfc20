import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";

const RefundPolicy = () => {
  return (
    <Layout>
      <SEO 
        title="Refund Policy"
        description="Understand VibeLink Events's refund policy for digital invitation orders, including full and partial refund conditions."
        canonical="/refund-policy"
        noindex={true}
      />
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Full Refund</h2>
            <p className="text-muted-foreground">
              You are entitled to a full refund of your deposit if you cancel your order before we begin any design work. This typically means within 24 hours of placing your order, provided no designer has been assigned to your project.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Partial Refund (After Draft Delivered)</h2>
            <p className="text-muted-foreground mb-4">
              Once the first draft has been delivered, the following refund structure applies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Before first revision:</strong> 50% of deposit refunded</li>
              <li><strong>After first revision:</strong> 25% of deposit refunded</li>
              <li><strong>After second revision:</strong> No refund available</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              The non-refundable portion covers the design work already completed by our team.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. No Refund</h2>
            <p className="text-muted-foreground mb-4">
              Refunds are not available in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>After final design approval has been given</li>
              <li>After the invitation has been published/gone live</li>
              <li>For add-on services that have been delivered</li>
              <li>For rush delivery fees after work has begun</li>
              <li>For hosting fees after the invitation has been published</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Event Cancellation</h2>
            <p className="text-muted-foreground">
              We understand that events may be cancelled due to unforeseen circumstances. In case of event cancellation:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li><strong>Before any design work:</strong> Full refund</li>
              <li><strong>During design process:</strong> Partial refund based on work completed</li>
              <li><strong>After completion:</strong> Credit note for future use (valid for 12 months)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. How to Request a Refund</h2>
            <p className="text-muted-foreground mb-4">
              To request a refund, please contact us with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Your order confirmation number</li>
              <li>The reason for your refund request</li>
              <li>Your preferred refund method (original payment method or Mobile Money)</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Refund requests are processed within 3-5 business days. The funds may take an additional 5-10 business days to appear in your account depending on your payment provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              If you're not satisfied with our refund decision, please contact our customer service team. We're committed to finding a fair resolution for all parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              For refund requests or questions:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>Email:</strong> refunds@vibelinkgh.com</li>
              <li><strong>WhatsApp:</strong> +49 157 5717 8561</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
