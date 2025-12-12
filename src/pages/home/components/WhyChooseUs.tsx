
export default function WhyChooseUs() {
  const features = [
    {
      image: '/images/features/simple.svg',
      title: '有夠簡單',
      description: '用簡單的圖表，輕鬆構思全方位的保障'
    },
    {
      image: '/images/features/clear.svg',
      title: '有夠清楚',
      description: '用生活化的語言，讓您清楚了解保障內容'
    },
    {
      image: '/images/features/complete.svg',
      title: '有夠完整',
      description: '商品的優缺點，業界不敢講的我都敢講'
    },
    {
      image: '/images/features/professional.svg',
      title: '有夠專業',
      description: '研究各家公司的商品，替您把關不踩雷'
    },
    {
      image: '/images/features/detailed.svg',
      title: '有夠詳細',
      description: '充分了解您的需求，客製您的保障規劃'
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            保家佳的5大服務特點
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            我們用最直白的方式，提供最專業的服務
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-teal-50 to-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-teal-100 hover:border-teal-300 text-center group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
