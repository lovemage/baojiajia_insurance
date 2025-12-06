import { useState } from 'react';

type Props = {
  onComplete: () => void;
};

export default function ContactFormStep({ onComplete }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredContact: 'phone',
    preferredTime: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formBody = new URLSearchParams();
      formBody.append('name', formData.name);
      formBody.append('phone', formData.phone);
      formBody.append('email', formData.email);
      formBody.append('preferredContact', formData.preferredContact === 'phone' ? '電話' : '電子郵件');
      formBody.append('preferredTime', formData.preferredTime);

      const response = await fetch('https://readdy.ai/api/form/d4hkl43amli27834ghs0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString()
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } catch (error) {
      console.error('提交失敗:', error);
      alert('提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isFormValid = formData.name && formData.phone && formData.email;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-user-line text-4xl text-teal-600"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">最後一步</h2>
        <p className="text-gray-600 text-lg">
          請留下您的聯絡資料，我們將為您準備完整的分析報告
        </p>
      </div>

      {submitSuccess ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-4xl text-green-600"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">提交成功！</h3>
          <p className="text-gray-600">正在為您準備 PDF 報告...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} data-readdy-form id="analysis-contact-form">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="請輸入您的姓名"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                聯絡電話 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="請輸入您的電話號碼"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                電子郵件 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="請輸入您的電子郵件"
              />
            </div>

            <div>
              <label htmlFor="preferredContact" className="block text-sm font-semibold text-gray-700 mb-2">
                偏好聯絡方式
              </label>
              <div className="relative">
                <select
                  id="preferredContact"
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none cursor-pointer text-sm"
                >
                  <option value="phone">電話</option>
                  <option value="email">電子郵件</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="preferredTime" className="block text-sm font-semibold text-gray-700 mb-2">
                方便聯絡時間
              </label>
              <div className="relative">
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none cursor-pointer text-sm"
                >
                  <option value="">請選擇時段</option>
                  <option value="morning">上午 (09:00-12:00)</option>
                  <option value="afternoon">下午 (13:00-18:00)</option>
                  <option value="evening">晚上 (18:00-21:00)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-teal-50 rounded-lg p-4 border border-teal-100">
            <div className="flex items-start">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3">
                <i className="ri-information-line text-teal-600 text-xl"></i>
              </div>
              <p className="text-sm text-gray-700">
                我們重視您的隱私，您的個人資料僅用於提供保險諮詢服務，不會外洩給第三方。
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`px-8 py-4 rounded-lg text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                !isFormValid || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  提交中...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line mr-2"></i>
                  提交並下載報告
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
