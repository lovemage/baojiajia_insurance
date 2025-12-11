import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Navigation from '../../components/feature/Navigation';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  content: string;
  hero_image_url?: string;
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('service_items')
          .select(`
            *,
            service_details (
              content,
              hero_image_url
            )
          `)
          .eq('slug', slug)
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setService({
            id: data[0].id,
            title: data[0].title,
            description: data[0].description,
            icon: data[0].icon,
            image_url: data[0].image_url,
            content: data[0].service_details?.[0]?.content || '',
            hero_image_url: data[0].service_details?.[0]?.hero_image_url
          });
        }
      } catch (error) {
        console.error('Error fetching service detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">找不到此服務項目</h2>
          <p className="text-gray-600 mb-6">抱歉，您要查看的服務項目不存在</p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            返回服務項目
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <Navigation />

      {/* Hero Section - 響應式縮放，PC端寬度1000px，圓角20px */}
      <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="relative h-96 sm:h-80 md:h-96 lg:h-96 w-full bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `url(${service.hero_image_url || service.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            maxWidth: '1000px',
            borderRadius: '20px'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 w-fit transition-colors whitespace-nowrap"
            >
              <i className="ri-arrow-left-line"></i>
              返回首頁
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                <i className={`${service.icon} text-3xl text-white`}></i>
              </div>
              <h1 className="text-5xl font-bold text-white">{service.title}</h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl">{service.description}</p>
          </div>
        </div>
      </div>

      {/* Content Section - 調整容器寬度為 1000px，字體縮小為 10px */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ maxWidth: '1000px' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <div
            className={`prose prose-sm max-w-none
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:first:mt-0
              prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-8
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-sm
              prose-ul:my-6 prose-ul:space-y-3
              prose-ol:my-6 prose-ol:space-y-3 prose-ol:list-inside
              prose-li:text-gray-700 prose-li:leading-relaxed prose-li:text-sm
              prose-strong:text-teal-600 prose-strong:font-semibold
              ${slug === 'policy-checkup' ? 'prose-ol:list-none' : 'prose-ol:list-decimal'}
            `}
            style={{ fontSize: '10px', lineHeight: '1.6' }}
            dangerouslySetInnerHTML={{ __html: service.content }}
          />

          {/* CTA Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-8 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-3">想了解更多？</h3>
              <p className="text-gray-700 mb-6 text-sm">歡迎與我們聯繫，我們將為您提供專業的諮詢服務</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  <i className="ri-mail-line"></i>
                  立即諮詢
                </Link>
                <Link
                  to="/analysis"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-teal-600 border-2 border-teal-500 rounded-lg hover:bg-teal-50 transition-colors whitespace-nowrap"
                >
                  <i className="ri-file-list-3-line"></i>
                  免費保單健診
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
