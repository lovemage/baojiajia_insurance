import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';

interface InsuranceType {
  id: string;
  name: string;
  icon: string;
  description: string;
  coverage: string[];
  tips: string[];
  keyPoints: string[];
}

const insuranceTypes: InsuranceType[] = [
  {
    id: 'life',
    name: '壽險',
    icon: 'ri-heart-pulse-line',
    description: '壽險是保障家人經濟安全的基礎，當被保險人身故或全殘時，保險公司會給付保險金給受益人，確保家人的生活不受影響。',
    coverage: [
      '身故保險金：被保險人不幸身故時，給付保險金給受益人',
      '全殘保險金：被保險人達到全殘狀態時，提前給付保險金'
    ],
    keyPoints: [
      '適合有家庭責任的人，如家庭支柱、有房貸車貸者',
      '保額建議為年收入的 5-10 倍加上未償債務'
    ],
    tips: [
      '壽險主要保障「遺族的經濟安全」，不是保障自己',
      '如果沒有家庭責任（如單身無負債），壽險優先順序可以降低'
    ]
  },
  {
    id: 'disability',
    name: '失能/長照險',
    icon: 'ri-wheelchair-line',
    description: '失能險和長照險都是保障「長期照護」的風險，當被保險人因疾病或意外導致失能或需要長期照護時，提供持續性的保險金給付。',
    coverage: [
      '失能一次金：依失能等級給付一次性保險金',
      '失能扶助金：每月或每年給付生活扶助金，直到身故或契約終止',
      '豁免保費：達到特定失能等級時，免繳後續保費'
    ],
    keyPoints: [
      '失能險理賠依「失能等級表」判定，較為客觀明確',
      '長照險理賠需符合「生理功能障礙」或「認知功能障礙」條件',
      '建議失能扶助金額度為每月 3-5 萬元，以支應看護及生活費用'
    ],
    tips: [
      '失能風險是「活著但失去工作能力」，比死亡更需要長期金錢支持',
      '年輕時投保保費較低，且核保較容易通過',
      '失能險和長照險可擇一規劃，或兩者搭配以提高保障'
    ]
  },
  {
    id: 'accident',
    name: '意外險',
    icon: 'ri-first-aid-kit-line',
    description: '意外險保障因「外來、突發、非疾病」造成的意外事故，提供身故、失能及醫療保障，是 CP 值最高的保險之一。',
    coverage: [
      '意外身故保險金：因意外事故身故時給付',
      '意外失能保險金：因意外導致失能時，依等級給付',
      '意外醫療實支實付：給付意外事故的醫療費用',
      '意外住院日額：因意外住院時，每日給付定額保險金'
    ],
    keyPoints: [
      '保費便宜，保障高，是人人都應該具備的基本保障',
      '意外住院日額包涵「骨折未住院津貼」，務必規劃',
      '意外醫療實支實付額度建議 3-5 萬以上'
    ],
    tips: [
      '意外險只保障「意外事故」，疾病導致的傷害不理賠',
      '職業類別會影響保費，高風險職業保費較高或無法投保',
      '產險公司的意外險通常會比壽險公司便宜，但要注意改版或停售後可能導致不可續保的問題'
    ]
  },
  {
    id: 'medical',
    name: '醫療險',
    icon: 'ri-hospital-line',
    description: '醫療險保障因疾病或意外住院、手術產生的醫療費用，是健保之外的重要補充保障，可減輕醫療費用負擔。',
    coverage: [
      '住院日額：住院期間每日給付固定金額',
      '實支實付：依實際醫療費用收據給付，可支應自費項目',
      '手術費用：依手術項目給付手術保險金'
    ],
    keyPoints: [
      '實支實付優先於日額型，可支應高額自費醫材和藥物',
      '建議實支實付額度至少 20-30 萬以上',
      '若想提高保障，可額外增加自負額醫療險'
    ],
    tips: [
      '實支實付是「補償型」保險，理賠金額不會超過實際支出',
      '注意「門診手術」和「住院手術」的理賠範圍',
      '定期醫療險保費較低，但年紀大時保費會調漲'
    ]
  },
  {
    id: 'cancer',
    name: '癌症險',
    icon: 'ri-medicine-bottle-line',
    description: '癌症險專門保障癌症相關的醫療和照護費用，包含初次罹癌、癌症住院、手術、化療、標靶治療等，是對抗癌症的重要後盾。',
    coverage: [
      '初次罹癌保險金：確診癌症時給付一次性保險金',
      '癌症住院日額：因癌症住院時每日給付',
      '癌症手術保險金：進行癌症相關手術時給付',
      '癌症治療保險金：化療、放療、標靶治療等給付'
    ],
    keyPoints: [
      '一次給付型癌症險較符合現代醫療趨勢',
      '建議初次罹癌保險金至少 100-200 萬元',
      '注意是否包含「原位癌」和「併發症」的理賠'
    ],
    tips: [
      '癌症治療趨向門診化，傳統住院日額型理賠機會降低',
      '標靶藥物和免疫療法費用高昂，需要足夠的一次金保障',
      '癌症險可搭配重大傷病險，提供更完整的保障'
    ]
  },
  {
    id: 'critical',
    name: '重大傷病險',
    icon: 'ri-shield-cross-line',
    description: '重大傷病險以健保「重大傷病卡」為理賠依據，涵蓋範圍廣（超過 300 項疾病），只要取得重大傷病卡就能申請理賠，理賠認定較為明確。',
    coverage: [
      '重大傷病一次金：取得重大傷病卡時給付一次性保險金',
      '豁免保費：符合條件時免繳後續保費',
      '涵蓋疾病：癌症、洗腎、重大器官移植、嚴重燒燙傷等 300+ 項'
    ],
    keyPoints: [
      '理賠依據明確，只要有重大傷病卡就能理賠',
      '涵蓋範圍比傳統重大疾病險更廣',
      '建議保額至少 100-150 萬元'
    ],
    tips: [
      '重大傷病險是「一次給付型」，可自由運用保險金',
      '相較於傳統重大疾病險，理賠爭議較少',
      '注意除外項目，如先天性疾病、職業病等可能不理賠'
    ]
  }
];

const comparisonData = [
  {
    aspect: '服務範圍',
    singleCompany: '僅能銷售單一保險公司的商品',
    broker: '可銷售多家保險公司的商品，選擇更多元'
  },
  {
    aspect: '保障規劃',
    singleCompany: '受限單一公司商品，選擇有限',
    broker: '可從多家公司中挑選出最適合的商品，客製化你的保障內容'
  },
  {
    aspect: '保費比較',
    singleCompany: '無法進行跨公司保費比較',
    broker: '可協助比較不同公司的保費和保障內容'
  },
  {
    aspect: '理賠協助',
    singleCompany: '協助單一公司的理賠申請',
    broker: '可協助多家公司的理賠申請，更有效率'
  },
  {
    aspect: '客觀性',
    singleCompany: '可能較偏向推薦自家公司商品',
    broker: '站在客戶立場，提供更客觀的建議'
  },
  {
    aspect: '專業度',
    singleCompany: '熟悉自家公司商品',
    broker: '需了解多家公司商品，專業要求更高'
  }
];

const faqs = [
  {
    question: '保險買了用不到是一種浪費嗎？',
    answer: '這是很多人的疑問，但保險的本質是「風險轉嫁」而非投資。就像我們買了汽車保險，不出車禍時也不會覺得浪費，因為保險買的是「安心」和「保障」。保險用不到代表我們很幸運，但萬一發生風險時，保險可以避免家庭經濟崩潰。重點是要買「對的保險」和「足夠的保額」，而不是買了一堆用不到的保障。'
  },
  {
    question: '定期險跟終身險有什麼差別？',
    answer: '定期險保障期間有限（如 10 年、20 年或保障到某個年齡），保費較便宜，適合預算有限但需要高保額的人。終身險保障終身，保費較高，但不用擔心年老後沒有保障。建議年輕時優先規劃定期險，用較低保費獲得足夠保障；等經濟能力提升後，再考慮終身險作為補充。記住：「保額足夠」比「保障終身」更重要。'
  },
  {
    question: '已經有勞保和健保、還需要商業保險嗎？',
    answer: '勞保和健保是基本保障，但保障額度有限。例如：勞保失能給付最高約 200 萬元，但長期照護費用可能需要數百萬甚至上千萬；健保雖然涵蓋大部分醫療費用，但自費項目（如標靶藥物、達文西手術）動輒數十萬元。商業保險是補足社會保險不足的重要工具，讓我們在面對重大風險時，不會因為醫療費用而拖垮家庭經濟。'
  },
  {
    question: '保險要繳多少才合理？',
    answer: '一般建議保費支出不超過年收入的 10-15%。例如年收入 60 萬元，保費預算約 6-9 萬元（每月 5,000-7,500 元）。但這只是參考值，實際應依個人狀況調整：家庭責任重的人可能需要更高保障；單身無負擔者可以降低預算。重點是要先規劃「必要保障」（如意外險、醫療險、失能險），再考慮其他險種。記住：保險是保障不是負擔，不要因為繳保費而影響生活品質。'
  },
  {
    question: '投保時需要注意什麼？',
    answer: '投保時最重要的是「誠實告知」，包括健康狀況、職業、既往病史等，否則可能影響理賠權益。其次要注意：1) 保障內容是否符合需求；2) 保費是否在預算內；3) 保險公司的理賠評價；4) 條款中的除外責任和等待期；5) 是否有保證續保。建議投保前多比較、多諮詢，不要因為人情壓力或業務話術就倉促投保。找專業的保險經紀人協助規劃，可以避免買錯保險。'
  }
];

export default function BeginnerPage() {
  const [selectedType, setSelectedType] = useState('life');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const currentInsurance = insuranceTypes.find(type => type.id === selectedType) || insuranceTypes[0];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">保險新手村</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            從零開始，輕鬆了解保險知識
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section 1: 認識六大保障 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">認識六大保障</h2>
            <p className="text-lg text-gray-600">人身保險主要分為六大類，每種保障都有其重要性</p>
          </div>

          {/* Insurance Type Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {insuranceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedType === type.id
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow border border-gray-200'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>

          {/* Insurance Detail Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center">
                <i className={`${currentInsurance.icon} text-3xl text-teal-600`}></i>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{currentInsurance.name}</h3>
            </div>

            <div className="mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">{currentInsurance.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-shield-check-line text-2xl text-teal-600"></i>
                  保障內容
                </h4>
                <ul className="space-y-3">
                  {currentInsurance.coverage.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <i className="ri-checkbox-circle-fill text-teal-500 text-xl mt-1 flex-shrink-0"></i>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-lightbulb-line text-2xl text-amber-500"></i>
                  重點提醒
                </h4>
                <ul className="space-y-3">
                  {currentInsurance.keyPoints.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <i className="ri-star-fill text-amber-500 text-xl mt-1 flex-shrink-0"></i>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-information-line text-2xl text-teal-600"></i>
                專家小提醒
              </h4>
              <ul className="space-y-2">
                {currentInsurance.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <i className="ri-arrow-right-s-line text-teal-600 text-xl mt-1 flex-shrink-0"></i>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: 該找誰規劃？ */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">該找誰規劃？</h2>
            <p className="text-lg text-gray-600">選對專業顧問，讓保險規劃更完善</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-6 px-8">
              <h3 className="text-2xl font-bold text-center">單一公司業務 vs 保險經紀人業務</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-4 px-6 text-center text-lg font-bold text-gray-900 border-b-2 border-gray-200 w-1/5">比較項目</th>
                    <th className="py-4 px-6 text-center text-lg font-bold text-gray-900 border-b-2 border-gray-200 w-2/5">單一公司業務</th>
                    <th className="py-4 px-6 text-center text-lg font-bold text-teal-600 border-b-2 border-teal-200 bg-teal-50 w-2/5">保險經紀人業務 ⭐</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">服務範圍</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">僅能銷售所屬公司的保險商品</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">可銷售多家保險公司的商品</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">保障規劃</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">受限單一公司商品，選擇有限</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">可從多家公司中挑選出最適合的商品，客製化你的保障內容</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">保費比較</td>
                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-700 font-medium">相同，各家保險公司的商品費率不會因通路不同改變</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">理賠協助</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">協助申請理賠</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">協助申請理賠，並可協調多家公司</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">客觀性</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">可能較偏向推薦自家商品</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">較客觀，以客戶需求為優先</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">專業度</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">熟悉自家商品</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">需了解多家公司商品，專業要求更高</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-lightbulb-flash-line text-2xl text-white"></i>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">為什麼建議找保險經紀人業務？</h4>
                  <p className="text-gray-700 leading-relaxed">
                    保險經紀人業務可以從多家保險公司中，為您挑選最適合的商品組合，不受限於單一公司的產品線。就像是您的「保險採購專家」，站在您的立場，客觀比較各家商品的優缺點和保費，幫您規劃出最符合需求且最具 CP 值的保障方案。此外，當需要理賠時，保險經紀人業務可以協助處理多家公司的理賠申請，讓您更省時省力。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: 常見問題解答 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">常見問題解答</h2>
            <p className="text-lg text-gray-600">解答保險新手最常遇到的疑問</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">Q{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 text-left">{faq.question}</h3>
                  </div>
                  <i className={`ri-arrow-${expandedFaq === index ? 'up' : 'down'}-s-line text-2xl text-gray-400 flex-shrink-0`}></i>
                </button>
                {expandedFaq === index && (
                  <div className="px-8 pb-6">
                    <div className="pl-14 pr-4">
                      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-3xl mx-auto">
          <Link
            to="/analysis"
            className="group relative px-10 py-5 bg-teal-500 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:bg-teal-600 transition-all duration-300 flex items-center gap-3 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-calculator-line text-2xl"></i>
            試算自己的保險需求
            <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
          </Link>
          <Link
            to="/contact"
            className="group relative px-10 py-5 bg-white text-teal-600 border-2 border-teal-500 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all duration-300 flex items-center gap-3 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-customer-service-2-line text-2xl"></i>
            立即諮詢
            <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
