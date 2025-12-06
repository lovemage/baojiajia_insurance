import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-r from-teal-600 to-teal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
            開始您的保險規劃之旅
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed px-4">
            先透過「需求分析 DIY」了解自己的保障缺口，或直接預約諮詢，讓保家佳為您量身規劃
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link 
              to="/analysis"
              className="w-full sm:w-auto bg-white text-teal-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap inline-block text-center"
            >
              立即開始需求分析
            </Link>
            <Link 
              to="/contact"
              className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/30 cursor-pointer whitespace-nowrap inline-block text-center"
            >
              預約專人諮詢
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
