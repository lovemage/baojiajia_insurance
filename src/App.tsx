import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { SEO } from "./components/SEO";


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SEO
        title="保家佳 | 保險理財知識分享"
        description="致力於保險知識分享及提供專業的保險諮詢服務。透過淺顯易懂的方式，讓您真正了解保險、善用保險，為家人建立完整的保護網。"
        keywords={["保家佳", "保險規劃", "保險知識", "醫療保險", "壽險", "意外險", "儲蓄險", "退休規劃"]}
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "保家佳",
          "url": "https://baojiajia.org",
          "logo": "https://baojiajia.org/hero.png",
          "sameAs": []
        }}
      />
      <BrowserRouter basename={__BASE_PATH__}>
        <AppRoutes />
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
