import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export default function Hero() {
  const [content, setContent] = useState({
    hero_title: '我們的願景是\n打破傳統保險業務的框架',
    hero_subtitle: '',
    hero_description: '提供對等、客觀、正確的資訊，\n讓大家在資訊爆炸的環境中有辨別好壞的能力。\n用專業的知識為你在市場中找出最適合的規劃方案！',
    hero_button1_text: '需求分析 DIY',
    hero_button1_link: '/analysis',
    hero_button2_text: '保險知識分享',
    hero_button2_link: '/blog',
    hero_image_url: 'https://readdy.ai/api/search-image?query=Warm%20family%20protection%20concept%20with%20happy%20Asian%20family%20silhouette%20in%20bright%20natural%20setting%2C%20soft%20golden%20lighting%2C%20simple%20clean%20background%20showing%20security%20and%20care%2C%20professional%20lifestyle%20photography%20with%20emotional%20warmth&width=1920&height=1080&seq=hero-baojia-main&orientation=landscape'
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const organized: any = {};
        data.forEach((item: any) => {
          organized[item.content_key] = item.content_value;
        });
        setContent(prev => ({ ...prev, ...organized }));
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center bg-cover bg-center"
    >
      {/* LCP 優化：使用 img 元素預載入背景圖片 */}
      <img
        src={content.hero_image_url}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: -1 }}
        key={content.hero_image_url} // 強制重新載入當 URL 改變時
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight whitespace-pre-line">
            {content.hero_title}
            {content.hero_subtitle && (
              <>
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl mt-2 block">{content.hero_subtitle}</span>
              </>
            )}
          </h1>
          <div className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl whitespace-pre-line">
            {content.hero_description}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link 
              to={content.hero_button1_link} 
              className="bg-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-teal-700 transition-colors text-center cursor-pointer whitespace-nowrap"
            >
              {content.hero_button1_text}
            </Link>
            <Link 
              to={content.hero_button2_link} 
              className="bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/30 text-center cursor-pointer whitespace-nowrap"
            >
              {content.hero_button2_text}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
