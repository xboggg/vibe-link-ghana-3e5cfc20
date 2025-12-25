import { Layout } from "@/components/layout/Layout";
import SEO from "@/components/SEO";

const CookiePolicy = () => {
  return (
    <Layout>
      <SEO 
        title="Cookie Policy"
        description="Learn about the cookies VibeLink Ghana uses on our website and how to manage your cookie preferences."
        canonical="/cookie-policy"
        noindex={true}
      />
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Are Cookies?</h2>
            <p className="text-muted-foreground">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing site traffic, and enabling certain features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Cookies We Use</h2>
            
            <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Essential Cookies</h3>
            <p className="text-muted-foreground mb-4">
              These cookies are necessary for the website to function properly. They enable core features like security, session management, and accessibility.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Session cookies:</strong> Keep you logged in during your visit</li>
              <li><strong>Security cookies:</strong> Protect against fraudulent activity</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Analytics Cookies</h3>
            <p className="text-muted-foreground mb-4">
              We use Google Analytics to understand how visitors interact with our website. This helps us improve our services.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>_ga:</strong> Distinguishes unique users (expires: 2 years)</li>
              <li><strong>_gid:</strong> Distinguishes unique users (expires: 24 hours)</li>
              <li><strong>_gat:</strong> Throttles request rate (expires: 1 minute)</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Functional Cookies</h3>
            <p className="text-muted-foreground">
              These cookies remember your preferences such as language, theme (dark/light mode), and other customizations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Third-Party Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Some third-party services we use may set their own cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Google Analytics:</strong> For website traffic analysis</li>
              <li><strong>Social Media Platforms:</strong> If you share content or interact with social buttons</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. How to Manage Cookies</h2>
            <p className="text-muted-foreground mb-4">
              You can control and manage cookies in several ways:
            </p>
            
            <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Browser Settings</h3>
            <p className="text-muted-foreground mb-4">
              Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies from specific sites</li>
              <li>Block all cookies from all sites</li>
              <li>Delete all cookies when you close the browser</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Opt-Out Links</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Impact of Disabling Cookies</h2>
            <p className="text-muted-foreground">
              If you disable cookies, some features of our website may not work properly. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Order form progress may not be saved</li>
              <li>Theme preferences may not be remembered</li>
              <li>You may need to log in more frequently</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Updates to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time. We will notify you of any significant changes by posting a notice on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about our use of cookies:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mt-4">
              <li><strong>Email:</strong> privacy@vibelinkgh.com</li>
              <li><strong>WhatsApp:</strong> +233 24 581 7973</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default CookiePolicy;
