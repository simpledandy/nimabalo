interface StructuredDataProps {
  type: 'Website' | 'Question' | 'QAPage';
  data: Record<string, any>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nimabalo.uz';
    
    switch (type) {
      case 'Website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Nimabalo",
          "alternateName": "Nima balo?",
          "url": baseUrl,
          "description": "O'zbek tilida savollar va javoblar platformasi. Anonim muhitda fikr almashing.",
          "inLanguage": "uz",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/questions?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Nimabalo",
            "url": baseUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.svg`
            }
          }
        };
      
      case 'Question':
        return {
          "@context": "https://schema.org",
          "@type": "Question",
          "name": data.title,
          "text": data.body || data.title,
          "dateCreated": data.created_at,
          "author": {
            "@type": "Person",
            "name": data.author?.full_name || data.author?.username || "Anonymous"
          },
          "url": `${baseUrl}/q/${data.id}`,
          "inLanguage": "uz"
        };
      
      case 'QAPage':
        return {
          "@context": "https://schema.org",
          "@type": "QAPage",
          "mainEntity": {
            "@type": "Question",
            "name": data.question.title,
            "text": data.question.body || data.question.title,
            "dateCreated": data.question.created_at,
            "author": {
              "@type": "Person",
              "name": data.author?.full_name || data.author?.username || "Anonymous"
            },
            "acceptedAnswer": data.answers?.length > 0 ? {
              "@type": "Answer",
              "text": data.answers[0].body,
              "dateCreated": data.answers[0].created_at,
              "author": {
                "@type": "Person",
                "name": "Community Member"
              }
            } : undefined,
            "suggestedAnswer": data.answers?.slice(1).map((answer: any) => ({
              "@type": "Answer",
              "text": answer.body,
              "dateCreated": answer.created_at,
              "author": {
                "@type": "Person",
                "name": "Community Member"
              }
            }))
          },
          "url": `${baseUrl}/q/${data.question.id}`,
          "inLanguage": "uz"
        };
      
      default:
        return {};
    }
  };

  const structuredData = generateStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}