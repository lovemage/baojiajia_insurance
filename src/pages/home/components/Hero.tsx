import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface HeroItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  button1_text: string;
  button1_link: string;
  button1_bg_color: string;
  button1_text_color: string;
  button2_text: string;
  button2_link: string;
  button2_bg_color: string;
  button2_text_color: string;
  image_url: string;
  cloudinary_public_id: string;
  overlay_opacity: number;
  button_position: 'left' | 'center' | 'right';
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function Hero() {
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselInterval, setCarouselInterval] = useState(5000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchHeroItems();
    fetchCarouselSettings();
  }, []);

  // 輪播自動播放
  useEffect(() => {
    if (heroItems.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % heroItems.length);
      }, carouselInterval);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [heroItems.length, carouselInterval]);

  const fetchHeroItems = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_carousel')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      console.log('Hero items loaded:', data);
      setHeroItems(data || []);
    } catch (error) {
      console.error('Error fetching hero items:', error);
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

  const currentHero = heroItems.length > 0 ? heroItems[currentIndex] : null;

  const handlePrevHero = () => {
    setCurrentIndex(prev => (prev - 1 + heroItems.length) % heroItems.length);
    // 重置自動播放計時器
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleNextHero = () => {
    setCurrentIndex(prev => (prev + 1) % heroItems.length);
    // 重置自動播放計時器
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (!currentHero) {
    return (
      <section className="relative min-h-screen flex items-center bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <p className="text-white text-lg">載入中...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-black flex items-center justify-center"
      style={{
        aspectRatio: '16 / 9',
        maxHeight: '100vh'
      }}
    >
      {/* Hero 背景圖片 - 同比例縮放 */}
      {currentHero.image_url ? (
        <img
          src={currentHero.image_url}
          alt={currentHero.title}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 z-0"
          key={currentHero.id}
          onError={(e) => {
            console.error('Image failed to load:', currentHero.image_url);
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', currentHero.image_url);
          }}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-black z-0"></div>
      )}

      {/* 動態遮罩 */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black to-black/30 z-5"
        style={{
          opacity: currentHero.overlay_opacity / 100
        }}
      ></div>

      {/* 隱藏式全版連結 (當按鈕文字為空但有連結時使用，例如首頁 Hero 圖片內建按鈕) */}
      {!currentHero.button1_text && currentHero.button1_link && currentHero.button1_link !== '#' && (
        <Link 
          to={currentHero.button1_link} 
          className="absolute inset-0 z-20 cursor-pointer"
          aria-label={currentHero.title || "前往詳細內容"}
        ></Link>
      )}

      {/* 內容容器 - 移動端絕對定位在底部 */}
      <div className="absolute bottom-4 sm:bottom-auto sm:relative z-10 w-full pointer-events-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl pointer-events-auto">
            {currentHero.title && (
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-3 md:mb-4 leading-tight whitespace-pre-line drop-shadow-lg">
                {currentHero.title}
                {currentHero.subtitle && (
                  <>
                    <br />
                    <span className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mt-1 block">{currentHero.subtitle}</span>
                  </>
                )}
              </h1>
            )}
            {currentHero.description && (
              <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white/90 mb-2 sm:mb-4 md:mb-6 leading-relaxed max-w-3xl whitespace-pre-line drop-shadow-md hidden sm:block">
                {currentHero.description}
              </div>
            )}
            {(currentHero.button1_text || currentHero.button2_text) && (
              <div className={`flex flex-row gap-2 sm:gap-3 md:gap-4 ${
                currentHero.button_position === 'center' ? 'justify-center' :
                currentHero.button_position === 'right' ? 'justify-end' :
                'justify-start'
              }`}>
                {currentHero.button1_text && (
                  <Link
                    to={currentHero.button1_link}
                    className="px-3 sm:px-5 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-colors text-center cursor-pointer whitespace-nowrap hover:opacity-80 shadow-lg"
                    style={{
                      backgroundColor: currentHero.button1_bg_color,
                      color: currentHero.button1_text_color
                    }}
                  >
                    {currentHero.button1_text}
                  </Link>
                )}
                {currentHero.button2_text && (
                  <Link
                    to={currentHero.button2_link}
                    className="px-3 sm:px-5 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-colors text-center cursor-pointer whitespace-nowrap border sm:border-2 hover:opacity-80 shadow-lg"
                    style={{
                      backgroundColor: currentHero.button2_bg_color,
                      color: currentHero.button2_text_color,
                      borderColor: currentHero.button2_text_color
                    }}
                  >
                    {currentHero.button2_text}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


    </section>
  );
}
