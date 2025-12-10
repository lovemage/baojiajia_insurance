import { useState } from 'react';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { sendTelegramNotification } from '../../services/telegramService';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    lineId: '',
    gender: '',
    birthDate: '',
    occupation: '',
    annualIncome: '',
    monthlyBudget: '',
    consultationType: '',
    otherConsultation: '',
    additionalMessage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formBody = new URLSearchParams();
      formBody.append('name', formData.name);
      formBody.append('phone', formData.phone);
      formBody.append('lineId', formData.lineId);
      formBody.append('gender', formData.gender === 'male' ? '男' : '女');
      formBody.append('birthDate', formData.birthDate);
      formBody.append('occupation', formData.occupation);
      formBody.append('annualIncome', formData.annualIncome);
      formBody.append('monthlyBudget', formData.monthlyBudget);
      formBody.append('consultationType', formData.consultationType === 'other' ? formData.otherConsultation : formData.consultationType);
      formBody.append('additionalMessage', formData.additionalMessage);

      const response = await fetch('https://readdy.ai/api/form/d4hkeu3amli27834ghq0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString()
      });

      if (response.ok) {
        // 發送 Telegram 通知
        try {
          await sendTelegramNotification({
            type: 'contact_form_submitted',
            memberName: formData.name,
            memberPhone: formData.phone,
            timestamp: new Date(),
            contactFormData: {
              lineId: formData.lineId,
              gender: formData.gender === 'male' ? '男' : '女',
              birthDate: formData.birthDate,
              occupation: formData.occupation,
              annualIncome: formData.annualIncome,
              monthlyBudget: formData.monthlyBudget,
              consultationType: formData.consultationType === 'other' ? formData.otherConsultation : formData.consultationType,
              additionalMessage: formData.additionalMessage
            }
          });
        } catch (error) {
          console.error('Failed to send Telegram notification:', error);
        }

        setSubmitStatus('success');
        setFormData({
          name: '',
          phone: '',
          lineId: '',
          gender: '',
          birthDate: '',
          occupation: '',
          annualIncome: '',
          monthlyBudget: '',
          consultationType: '',
          otherConsultation: '',
          additionalMessage: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">聯絡我們</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto px-4">
            有任何問題或需求，歡迎隨時與我們聯繫，我們將竭誠為您服務
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">立即預約免費諮詢</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              填寫以下表單，我們的專業顧問將在24小時內與您聯繫，為您提供最適合的保險規劃建議。
            </p>

            <form onSubmit={handleSubmit} data-readdy-form id="contact-form" className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  姓名 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="請輸入真實姓名"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  聯絡電話 *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="聯絡電話"
                />
              </div>

              <div>
                <label htmlFor="lineId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Line ID *
                </label>
                <input
                  type="text"
                  id="lineId"
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Line ID"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  性別 *
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      required
                      className="w-5 h-5 text-teal-600 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">男</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      required
                      className="w-5 h-5 text-teal-600 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">女</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  生日 *
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm cursor-pointer"
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div>
                <label htmlFor="occupation" className="block text-sm font-semibold text-gray-700 mb-2">
                  職等 *
                </label>
                <div className="relative">
                  <select
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm pr-8 cursor-pointer appearance-none"
                  >
                    <option value="">請選擇</option>
                    <option value="職等1（內勤人員、教師、家管...等）">職等1（內勤人員、教師、家管...等）</option>
                    <option value="職等2（外勤人員、業務、工程師...等）">職等2（外勤人員、業務、工程師...等）</option>
                    <option value="職等3（一般軍警、遊覽車司機...等）">職等3（一般軍警、遊覽車司機...等）</option>
                    <option value="職等4（模板工、水電工、計程車司機...等）">職等4（模板工、水電工、計程車司機...等）</option>
                    <option value="職等5（刑警、焊接工、高樓外部清潔工...等）">職等5（刑警、焊接工、高樓外部清潔工...等）</option>
                    <option value="職等6（機上服務員、消防員...等）">職等6（機上服務員、消防員...等）</option>
                    <option value="我不知道我的職業等級">我不知道我的職業等級</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 flex items-center justify-center">
                    <i className="ri-arrow-down-s-line text-gray-400"></i>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="annualIncome" className="block text-sm font-semibold text-gray-700 mb-2">
                  收入(年) *
                </label>
                <div className="relative">
                  <select
                    id="annualIncome"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm pr-8 cursor-pointer appearance-none"
                  >
                    <option value="">請選擇</option>
                    <option value="30萬以下">30萬以下</option>
                    <option value="30-50萬">30-50萬</option>
                    <option value="50-70萬">50-70萬</option>
                    <option value="70-100萬">70-100萬</option>
                    <option value="100-150萬">100-150萬</option>
                    <option value="150萬以上">150萬以上</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 flex items-center justify-center">
                    <i className="ri-arrow-down-s-line text-gray-400"></i>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="monthlyBudget" className="block text-sm font-semibold text-gray-700 mb-2">
                  預算(月) *
                </label>
                <div className="relative">
                  <select
                    id="monthlyBudget"
                    name="monthlyBudget"
                    value={formData.monthlyBudget}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm pr-8 cursor-pointer appearance-none"
                  >
                    <option value="">請選擇</option>
                    <option value="3000~5000">3000~5000</option>
                    <option value="5000~10000">5000~10000</option>
                    <option value="10000~15000">10000~15000</option>
                    <option value="15000~20000">15000~20000</option>
                    <option value="20000以上">20000以上</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 flex items-center justify-center">
                    <i className="ri-arrow-down-s-line text-gray-400"></i>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="consultationType" className="block text-sm font-semibold text-gray-700 mb-2">
                  此次諮詢的主要需求 *
                </label>
                <div className="relative">
                  <select
                    id="consultationType"
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm pr-8 cursor-pointer appearance-none"
                  >
                    <option value="">請選擇</option>
                    <option value="首購族諮詢（過去不曾規劃保險）">首購族諮詢（過去不曾規劃保險）</option>
                    <option value="舊保單健診（檢視既有保障缺口）">舊保單健診（檢視既有保障缺口）</option>
                    <option value="調整保費預算（覺得目前保費負擔太重）">調整保費預算（覺得目前保費負擔太重）</option>
                    <option value="補強特定保障（例如：癌症/醫療/失能/意外）">補強特定保障（例如：癌症/醫療/失能/意外）</option>
                    <option value="新生兒/兒童保單規劃">新生兒/兒童保單規劃</option>
                    <option value="other">其他</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 flex items-center justify-center">
                    <i className="ri-arrow-down-s-line text-gray-400"></i>
                  </div>
                </div>
              </div>

              {formData.consultationType === 'other' && (
                <div>
                  <label htmlFor="otherConsultation" className="block text-sm font-semibold text-gray-700 mb-2">
                    請說明您的需求 *
                  </label>
                  <textarea
                    id="otherConsultation"
                    name="otherConsultation"
                    value={formData.otherConsultation}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                    placeholder="請詳細說明您的諮詢需求..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.otherConsultation.length}/500 字元
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="additionalMessage" className="block text-sm font-semibold text-gray-700 mb-2">
                  還有什麼想跟我們說或需要我們協助的嗎？
                </label>
                <textarea
                  id="additionalMessage"
                  name="additionalMessage"
                  value={formData.additionalMessage}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                  placeholder="請告訴我們您的想法或需求..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.additionalMessage.length}/500 字元
                </p>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm">
                  感謝您的留言！我們將盡快與您聯繫。
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm">
                  提交失敗，請稍後再試或直接撥打電話聯繫我們。
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {isSubmitting ? '提交中...' : '提交諮詢'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}