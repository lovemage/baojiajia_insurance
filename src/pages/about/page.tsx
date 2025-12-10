import { useState, useEffect } from 'react';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface AboutContent {
  mission_title: string;
  mission_content: string;
  hero_image?: string;
  intro_visible: boolean;
  team_visible: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

interface CoreValue {
  id: string;
  icon: string;
  title: string;
  description: string;
  is_active: boolean;
}

export default function About() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentRes, teamRes, valuesRes] = await Promise.all([
        supabase.from('about_content').select('*').single(),
        supabase.from('team_members').select('*').eq('is_active', true).order('display_order', { ascending: true }),
        supabase.from('core_values').select('*').eq('is_active', true).order('display_order', { ascending: true })
      ]);

      if (contentRes.data) setAboutContent(contentRes.data);
      if (teamRes.data) setTeamMembers(teamRes.data);
      if (valuesRes.data) setCoreValues(valuesRes.data);
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMissionContent = (content?: string) => {
    if (!content) return '';
    return content
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<br\s*\/?>(\r?\n)?/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const missionText = formatMissionContent(aboutContent?.mission_content);
  const missionParagraphs = (missionText || `在保險市場上，因為有成千上萬的商品、密密麻麻的條款、艱澀難懂的專業術語，又甚至是一些不公開的銷售話術...等。導致一般人想要看懂保險真的是困難重重！也因此保險業總是被說是個「水很深」的行業。

可是，如果想找保險業務了解，每一個業務各說各的好，是真是假難以分辨！又或是怕找了業務會遇到強迫推銷、人情壓力的問題。

保家佳的成立，就是希望能創造一個沒有推銷壓力的知識環境，我們希望用白話文的說明讓保險變得簡單易懂，也陪著您破解那些討人厭的話術！我們相信，唯有真正了解保險，才能做出最適合自己的決策。

我們也希望能陪伴您走過人生每個重要的階段，為您和家人建立最完善的保障。`).split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const heroImage = aboutContent?.hero_image?.trim()
    ? aboutContent.hero_image
    : 'https://static.readdy.ai/image/84ccad05498cbded7957a6723736d89e/553b31e20439f8b0fc75c472c1b546a0.png';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">保家佳的命名由來</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            我們相信「保險」是保護「家庭」的「最佳」工具！
          </p>
        </div>
      </section>

      {/* 保家佳的成立初衷 - Only show if intro_visible is true */}
      {aboutContent?.intro_visible && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* 左側文字 */}
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {aboutContent?.mission_title || '保家佳的成立初衷'}
                </h2>
                <div className="space-y-4 text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                  {missionParagraphs.map((paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* 右側圖片 */}
              <div className="relative w-full">
                <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                  <img
                    src={heroImage}
                    alt="保家佳團隊"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 團隊成員 - Only show if team_visible is true */}
      {aboutContent?.team_visible && teamMembers.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">專業團隊</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                最值得信賴的保險顧問團隊
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all">
                  <div className="aspect-w-3 aspect-h-4 relative overflow-hidden">
                    <img 
                      src={member.image_url} 
                      alt={member.name} 
                      className="w-full h-80 object-cover object-top transform group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-teal-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 核心價值 */}
      <section className={`py-12 sm:py-16 md:py-20 ${aboutContent?.team_visible ? 'bg-white' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">我們的核心價值</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              這些價值觀是保家佳的根基
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {(coreValues.length > 0 ? coreValues : [
              {
                icon: 'ri-book-open-line',
                title: '知識分享',
                description: '透過淺顯易懂的內容，讓保險知識不再是專業術語，而是每個人都能理解的生活常識'
              },
              {
                icon: 'ri-heart-line',
                title: '真誠服務',
                description: '不推銷、不話術，用真心傾聽客戶需求，提供最適合的保險建議'
              },
              {
                icon: 'ri-shield-check-line',
                title: '專業透明',
                description: '保單條款、費用結構完全透明，用專業知識為客戶把關每一份保單'
              },
              {
                icon: 'ri-community-line',
                title: '社群互動',
                description: '透過 Instagram 與客戶互動,建立保險知識社群,一起學習成長'
              }
            ]).map((value, index) => (
              <div 
                key={index}
                className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-shadow text-center border border-gray-100"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center bg-teal-100 rounded-full mx-auto mb-4 sm:mb-5 md:mb-6">
                  <i className={`${value.icon} text-2xl sm:text-2xl md:text-3xl text-teal-600`}></i>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            開始您的保險規劃
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto px-4">
            先了解保險知識，再做出最適合的決策
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link 
              to="/analysis"
              className="inline-block bg-white text-teal-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              需求分析 DIY
            </Link>
            <Link 
              to="/blog"
              className="inline-block bg-white/10 backdrop-blur-sm text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/30 cursor-pointer whitespace-nowrap"
            >
              閱讀保險知識
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
