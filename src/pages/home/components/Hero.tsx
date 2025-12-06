
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section 
      className="relative min-h-screen flex items-center bg-cover bg-center"
      style={{
        backgroundImage: `url(https://readdy.ai/api/search-image?query=Warm%20family%20protection%20concept%20with%20happy%20Asian%20family%20silhouette%20in%20bright%20natural%20setting%2C%20soft%20golden%20lighting%2C%20simple%20clean%20background%20showing%20security%20and%20care%2C%20professional%20lifestyle%20photography%20with%20emotional%20warmth&width=1920&height=1080&seq=hero-baojia-main&orientation=landscape)`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            我們的願景是<br />打破傳統保險業務的框架
          </h1>
          <div className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-3xl">
            <p className="mb-2">提供對等、客觀、正確的資訊，</p>
            <p className="mb-2">讓大家在資訊爆炸的環境中有辨別好壞的能力。</p>
            <p>用專業的知識為你在市場中找出最適合的規劃方案！</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link 
              to="/analysis" 
              className="bg-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-teal-700 transition-colors text-center cursor-pointer whitespace-nowrap"
            >
              需求分析 DIY
            </Link>
            <Link 
              to="/blog" 
              className="bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/30 text-center cursor-pointer whitespace-nowrap"
            >
              保險知識分享
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
