import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { SEO } from '../../components/SEO';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  slug: string;
  display_order: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('service_items')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="專業保險服務項目 | 保家佳"
        description="提供全方位的專業保險服務，包括保單健診、醫療保障規劃、退休理財方案等，為您的未來提供最完善的保障。"
        keywords={["保險服務", "保單健診", "醫療保障", "退休規劃", "保險諮詢"]}
        url="/services"
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">我們的服務</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            專業的保險規劃團隊，為您提供全方位的保障服務，從保單健診到退休規劃，讓您的每一分保費都發揮最大效益
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-16 h-16 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <i className={`${service.icon} text-3xl text-white`}></i>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">{service.description}</p>

                <Link
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  閱讀完整介紹
                  <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">還在猶豫嗎？</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            立即預約免費保單健診，讓我們的專業團隊為您分析現有保障，找出最適合您的保險規劃
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/analysis"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-lg hover:shadow-xl text-lg font-semibold whitespace-nowrap"
            >
              <i className="ri-file-list-3-line"></i>
              免費保單健診
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 border-2 border-teal-500 rounded-lg hover:bg-teal-50 transition-colors text-lg font-semibold whitespace-nowrap"
            >
              <i className="ri-customer-service-2-line"></i>
              聯絡我們
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
