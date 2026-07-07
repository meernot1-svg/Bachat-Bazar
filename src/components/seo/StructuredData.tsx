'use client';

import Script from 'next/script';

// Organization structured data for Google
const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bachat Bazar",
  "url": "https://bachatbazar.pk",
  "logo": "https://bachatbazar.pk/logo.svg",
  "description": "Pakistan's #1 Online Shopping Marketplace offering best prices on Electronics, Beauty, Fashion, Grocery & more.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Gulberg III",
    "addressLocality": "Lahore",
    "addressRegion": "Punjab",
    "addressCountry": "Pakistan"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+92-42-3576-1234",
    "contactType": "customer service",
    "availableLanguage": ["English", "Urdu"]
  },
  "sameAs": [
    "https://facebook.com/bachatbazar",
    "https://instagram.com/bachatbazar",
    "https://twitter.com/bachatbazar"
  ]
};

// Website structured data with search action
const websiteData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Bachat Bazar",
  "url": "https://bachatbazar.pk",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://bachatbazar.pk/#/shop?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// E-commerce store structured data
const storeData = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Bachat Bazar",
  "description": "Pakistan's premier online marketplace with best deals on electronics, beauty, fashion, grocery and more.",
  "url": "https://bachatbazar.pk",
  "priceRange": "Rs 100 - Rs 500,000",
  "currency": "PKR",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "PKR",
    "lowPrice": "100",
    "highPrice": "500000",
    "offerCount": "100+"
  }
};

export function StructuredData() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(organizationData)}
      </Script>
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(websiteData)}
      </Script>
      <Script
        id="store-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(storeData)}
      </Script>
    </>
  );
}