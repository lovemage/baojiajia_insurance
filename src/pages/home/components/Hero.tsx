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
      className="relative min-h-screen flex items-center bg-cover bg-center overflow-hidden bg-black"
    >
      {/* Hero 背景圖片 */}
      {currentHero.image_url ? (
        <img
          src={currentHero.image_url}
          alt={currentHero.title}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0"
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

      {/* 內容容器 */}
      <div className="relative z-10 w-full pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl pointer-events-auto">
            {currentHero.title && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight whitespace-pre-line">
                {currentHero.title}
                {currentHero.subtitle && (
                  <>
                    <br />
                    <span className="text-2xl sm:text-3xl md:text-4xl mt-2 block">{currentHero.subtitle}</span>
                  </>
                )}
              </h1>
            )}
            {currentHero.description && (
              <div className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl whitespace-pre-line">
                {currentHero.description}
              </div>
            )}
            {(currentHero.button1_text || currentHero.button2_text) && (
              <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${
                currentHero.button_position === 'center' ? 'justify-center' :
                currentHero.button_position === 'right' ? 'justify-end' :
                'justify-start'
              }`}>
                {currentHero.button1_text && (
                  <Link
                    to={currentHero.button1_link}
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-colors text-center cursor-pointer whitespace-nowrap hover:opacity-80"
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
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-colors text-center cursor-pointer whitespace-nowrap border-2 hover:opacity-80"
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

      {/* 輪播控制 - 只在有多個 Hero 時顯示 */}
      {heroItems.length > 1 && (
        <>
          {/* 上一個按鈕 */}
          <button
            onClick={handlePrevHero}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous hero"
          >
            <i className="ri-arrow-left-s-line text-2xl"></i>
          </button>

          {/* 下一個按鈕 */}
          <button
            onClick={handleNextHero}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Next hero"
          >
            <i className="ri-arrow-right-s-line text-2xl"></i>
          </button>

          {/* 指示點 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to hero ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
