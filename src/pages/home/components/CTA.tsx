import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export default function CTA() {
  const [content, setContent] = useState({
    cta_title: '開始您的保險規劃之旅',
    cta_description: '先透過「需求分析 DIY」了解自己的保障缺口，或直接預約諮詢，讓保家佳為您量身規劃',
    cta_button1_text: '立即開始需求分析',
    cta_button1_link: '/analysis',
    cta_button2_text: '預約專人諮詢',
    cta_button2_link: '/contact'
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
      console.error('Error fetching CTA content:', error);
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-r from-teal-600 to-teal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 whitespace-pre-line">
            {content.cta_title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed px-4 whitespace-pre-line">
            {content.cta_description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link 
              to={content.cta_button1_link}
              className="w-full sm:w-auto bg-white text-teal-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap inline-block text-center"
            >
              {content.cta_button1_text}
            </Link>
            <Link 
              to={content.cta_button2_link}
              className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/30 cursor-pointer whitespace-nowrap inline-block text-center"
            >
              {content.cta_button2_text}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
