import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

// Organization schema - used site-wide
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://vibelinkevent.com/#organization",
  name: "VibeLink Events",
  alternateName: "VibeLink",
  description: "Ghana's premier digital invitation service for weddings, funerals, naming ceremonies, graduations & corporate events.",
  url: "https://vibelinkevent.com",
  logo: "https://vibelinkevent.com/og-image.jpg",
  image: "https://vibelinkevent.com/og-image.jpg",
  telephone: "+233-XX-XXX-XXXX",
  email: "hello@vibelinkevent.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Accra",
    addressCountry: "GH",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 5.6037,
    longitude: -0.187,
  },
  areaServed: {
    "@type": "Country",
    name: "Ghana",
  },
  priceRange: "₵₵",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  sameAs: [
    "https://www.instagram.com/vibelinkgh",
    "https://www.facebook.com/vibelinkgh",
    "https://twitter.com/vibelinkgh",
  ],
};

// Website schema
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://vibelinkevent.com/#website",
  url: "https://vibelinkevent.com",
  name: "VibeLink Events",
  description: "Ghana's premier digital invitation service",
  publisher: {
    "@id": "https://vibelinkevent.com/#organization",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://vibelinkevent.com/portfolio?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const SEO = ({
  title = "VibeLink Events | Digital Event Invitations",
  description = "Ghana's premier digital invitation service. Create stunning interactive invitations for weddings, funerals, naming ceremonies, graduations & corporate events.",
  keywords = "digital invitations Ghana, wedding invitations Ghana, funeral programs Ghana, naming ceremony invitations, event invitations Accra",
  canonical,
  ogImage = "https://vibelinkevent.com/og-image.jpg",
  ogType = "website",
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const fullTitle = title.includes("VibeLink") ? title : `${title} | VibeLink Events`;
  const siteUrl = "https://vibelinkevent.com";
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;

  // Combine base schemas with page-specific schemas
  const allSchemas = [
    organizationSchema,
    websiteSchema,
    ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
  ];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="VibeLink Events" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(allSchemas)}
      </script>
    </Helmet>
  );
};

export default SEO;

// Helper schemas for specific page types
export const createServiceSchema = (services: Array<{ name: string; description: string; price?: string }>) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  provider: {
    "@id": "https://vibelinkevent.com/#organization",
  },
  areaServed: {
    "@type": "Country",
    name: "Ghana",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Digital Invitation Services",
    itemListElement: services.map((service, index) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
      },
      price: service.price,
      priceCurrency: "GHS",
      position: index + 1,
    })),
  },
});

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `https://vibelinkevent.com${item.url}`,
  })),
});

export const createArticleSchema = (article: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  author: {
    "@type": "Organization",
    name: article.author || "VibeLink Events",
    url: "https://vibelinkevent.com",
  },
  publisher: {
    "@id": "https://vibelinkevent.com/#organization",
  },
  image: article.image || "https://vibelinkevent.com/og-image.jpg",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://vibelinkevent.com${article.url}`,
  },
});
