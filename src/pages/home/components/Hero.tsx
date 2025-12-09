import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface CarouselImage {
  id: string;
  image_url: string;
  display_order: number;
}

export default function Hero() {
  const [content, setContent] = useState({
    hero_title: '我們的願景是\n打破傳統保險業務的框架',
    hero_subtitle: '',
    hero_description: '提供對等、客觀、正確的資訊，\n讓大家在資訊爆炸的環境中有辨別好壞的能力。\n用專業的知識為你在市場中找出最適合的規劃方案！',
    hero_button1_text: '需求分析 DIY',
    hero_button1_link: '/analysis',
    hero_button2_text: '保險知識分享',
    hero_button2_link: '/blog'
  });

  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselInterval, setCarouselInterval] = useState(5000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchContent();
    fetchCarouselImages();
    fetchCarouselSettings();
  }, []);

  // 輪播自動播放
  useEffect(() => {
    if (carouselImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % carouselImages.length);
      }, carouselInterval);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [carouselImages.length, carouselInterval]);

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

  const fetchCarouselImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_carousel')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      console.log('Carousel images loaded:', data);
      setCarouselImages(data || []);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const fetchCarouselSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_settings')
        .select('*')
        .eq('setting_key', 'carousel_interval');

      if (error) throw error;
      if (data && data.length > 0) {
        setCarouselInterval(parseInt(data[0].setting_value) || 5000);
      }
    } catch (error) {
      console.error('Error fetching carousel settings:', error);
    }
  };

  const currentImage = carouselImages.length > 0 ? carouselImages[currentImageIndex] : null;

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + carouselImages.length) % carouselImages.length);
    // 重置自動播放計時器
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % carouselImages.length);
    // 重置自動播放計時器
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <section
      className="relative min-h-screen flex items-center bg-cover bg-center overflow-hidden bg-black"
    >
      {/* 輪播圖片 */}
      {currentImage ? (
        <img
          src={currentImage.image_url}
          alt="Hero carousel"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0"
          key={currentImage.id}
          onError={(e) => {
            console.error('Image failed to load:', currentImage.image_url);
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', currentImage.image_url);
          }}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-black z-0"></div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-5"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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

      {/* 輪播控制 - 只在有多張圖片時顯示 */}
      {carouselImages.length > 1 && (
        <>
          {/* 上一張按鈕 */}
          <button
            onClick={handlePrevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <i className="ri-arrow-left-s-line text-2xl"></i>
          </button>

          {/* 下一張按鈕 */}
          <button
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Next image"
          >
            <i className="ri-arrow-right-s-line text-2xl"></i>
          </button>

          {/* 指示點 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
