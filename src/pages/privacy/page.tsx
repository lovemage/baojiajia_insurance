import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">隱私權政策</h1>
          
          <div className="prose prose-lg text-gray-600 space-y-8">
            <section>
              <p>
                保家佳（以下簡稱「本平台」）非常重視您的隱私權。為了讓您安心使用本平台的各項服務，特此向您說明本平台的隱私權保護政策，以保障您的權益，請您詳閱下列內容：
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">1. 隱私權保護政策的適用範圍</h2>
              <p>
                隱私權保護政策內容，包括本平台如何處理在您使用網站服務時收集到的個人識別資料。本隱私權保護政策不適用於本平台以外的相關連結網站，也不適用於非本平台所委託或參與管理的人員。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">2. 個人資料的蒐集、處理及利用方式</h2>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>當您造訪本平台或使用本平台所提供之功能服務時，我們將視該服務功能性質，請您提供必要的個人資料，並在該特定目的範圍內處理及利用您的個人資料。</li>
                <li>本平台進行保險需求分析時所蒐集的資料，僅作為提供分析結果及建議之用，非經您書面同意，本平台不會將個人資料用於其他用途。</li>
                <li>於一般瀏覽時，伺服器會自行記錄相關行徑，包括您使用連線設備的IP位址、使用時間、使用的瀏覽器、瀏覽及點選資料記錄等，做為我們增進網站服務的參考依據，此記錄為內部應用，決不對外公佈。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">3. 資料之保護</h2>
              <p>
                本平台主機均設有防火牆、防毒系統等相關的各項資訊安全設備及必要的安全防護措施，加以保護網站及您的個人資料採用嚴格的保護措施，只由經過授權的人員才能接觸您的個人資料，相關處理人員皆簽有保密合約，如有違反保密義務者，將會受到相關的法律處分。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">4. 網站對外的相關連結</h2>
              <p>
                本平台的網頁提供其他網站的網路連結，您也可經由本平台所提供的連結，點選進入其他網站。但該連結網站不適用本平台的隱私權保護政策，您必須參考該連結網站中的隱私權保護政策。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">5. 與第三人共用個人資料之政策</h2>
              <p>
                本平台絕不會提供、交換、出租或出售任何您的個人資料給其他個人、團體、私人企業或公務機關，但有法律依據或合約義務者，不在此限。
              </p>
              <p className="mt-2">前項但書之情形包括不限於：</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>經由您書面同意。</li>
                <li>法律明文規定。</li>
                <li>為免除您生命、身體、自由或財產上之危險。</li>
                <li>與公務機關或學術研究機構合作，基於公共利益為統計或學術研究而有必要，且資料經過提供者處理或蒐集者依其揭露方式無從識別特定之當事人。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">6. Cookie 之使用</h2>
              <p>
                為了提供您最佳的服務，本平台會在您的電腦中放置並取用我們的 Cookie，若您不願接受 Cookie 的寫入，您可在您使用的瀏覽器功能項中設定隱私權等級為高，即可拒絕 Cookie 的寫入，但可能會導致網站某些功能無法正常執行。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">7. 隱私權保護政策之修正</h2>
              <p>
                本平台隱私權保護政策將因應需求隨時進行修正，修正後的條款將刊登於網站上。
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
