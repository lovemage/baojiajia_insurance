
import { Link } from 'react-router-dom';
import Hero from './components/Hero';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { SEO } from '../../components/SEO';

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.baojiajia.org/#organization",
        "name": "保家佳",
        "url": "https://www.baojiajia.org/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.baojiajia.org/hero.png",
          "width": 512,
          "height": 512
        },
        "description": "致力於保險知識分享及提供專業的保險諮詢服務。",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "areaServed": "TW",
          "availableLanguage": "zh-TW"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://www.baojiajia.org/#website",
        "url": "https://www.baojiajia.org/",
        "name": "保家佳",
        "description": "保險理財知識分享",
        "publisher": {
          "@id": "https://www.baojiajia.org/#organization"
        },
        "inLanguage": "zh-TW"
      },
      {
        "@type": "WebPage",
        "@id": "https://www.baojiajia.org/#webpage",
        "url": "https://www.baojiajia.org/",
        "name": "保家佳 | 保險理財知識分享",
        "isPartOf": {
          "@id": "https://www.baojiajia.org/#website"
        },
        "about": {
          "@id": "https://www.baojiajia.org/#organization"
        },
        "description": "致力於保險知識分享及提供專業的保險諮詢服務。透過淺顯易懂的方式，讓您真正了解保險、善用保險，為家人建立完整的保護網。",
        "inLanguage": "zh-TW"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="保家佳 | 保險理財知識分享"
        description="致力於保險知識分享及提供專業的保險諮詢服務。透過淺顯易懂的方式，讓您真正了解保險、善用保險，為家人建立完整的保護網。"
        keywords={["保家佳", "保險規劃", "保險知識", "醫療保險", "壽險", "意外險", "儲蓄險", "退休規劃"]}
        schema={schema}
      />
      <Navigation />
      <Hero />
      <Services />
      <WhyChooseUs />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
