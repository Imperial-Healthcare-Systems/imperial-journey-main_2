const data = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Imperial Journeys",
  description:
    "Curated journeys, bespoke holidays, and signature experiences across India and the world.",
  url: "https://imperialjourneys.com",
  parentOrganization: {
    "@type": "Organization",
    name: "Imperial Healthcare Systems Pvt Ltd",
  },
  telephone: ["+91-73580-13585", "+1-859-978-8780"],
  email: "info@imperialtechinnovations.com",
  address: [
    {
      "@type": "PostalAddress",
      streetAddress:
        "M15, Ground Floor, Regus, Welldone Tech Park, Sohna Road, Sector 48",
      addressLocality: "Gurugram",
      postalCode: "122018",
      addressRegion: "Haryana",
      addressCountry: "IN",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "212 N. 2nd St. STE 100",
      addressLocality: "Richmond",
      postalCode: "40475",
      addressRegion: "KY",
      addressCountry: "US",
    },
  ],
  areaServed: ["IN", "US", "Worldwide"],
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
