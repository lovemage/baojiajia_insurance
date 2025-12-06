import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">服務條款</h1>
          
          <div className="prose prose-lg text-gray-600 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">1. 條款接受</h2>
              <p>
                歡迎使用保家佳（以下簡稱「本平台」）。當您使用本平台提供的服務時，即表示您已閱讀、瞭解並同意接受本服務條款之所有內容。如果您不同意本服務條款的任何部分，請停止使用本平台服務。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">2. 服務內容</h2>
              <p>
                本平台提供保險資訊分享、需求分析及諮詢預約服務。我們致力於提供正確的保險資訊，但所有資訊僅供參考，實際保險商品內容與權利義務以各保險公司之正式保單條款為準。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">3. 使用者義務</h2>
              <p>
                您同意在使用本平台服務時遵守以下規定：
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>提供真實、正確、最新且完整的個人資料。</li>
                <li>不利用本平台從事任何非法或未經授權的行為。</li>
                <li>不干擾或破壞本平台的運作或伺服器。</li>
                <li>遵守中華民國相關法規及網際網路使用慣例。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">4. 免責聲明</h2>
              <p>
                本平台提供的保險分析結果僅供參考，不代表最終核保結果或理賠承諾。保險商品的詳細內容、承保範圍及不保事項，請以保險公司正式文件為準。本平台不對因使用或無法使用本服務而產生的任何直接、間接損害負責。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">5. 智慧財產權</h2>
              <p>
                本平台所使用之軟體或程式、網站上所有內容，包括但不限於著作、圖片、檔案、資訊、資料、網站架構、網站畫面的安排、網頁設計，均由本平台或其他權利人依法擁有其智慧財產權。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">6. 條款修改</h2>
              <p>
                本平台保留隨時修改本服務條款之權利，修改後的條款將公佈於網站上，不另行個別通知。您於任何修改或變更後繼續使用本服務，視為您已閱讀、瞭解並同意接受該等修改或變更。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">7. 聯絡我們</h2>
              <p>
                若您對本服務條款有任何疑問，請透過聯絡我們頁面與我們聯繫。
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
