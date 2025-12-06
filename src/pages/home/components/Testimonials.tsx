const testimonials = [
  {
    name: '小美',
    role: '30歲上班族',
    content: '之前對保險完全不懂，看了保家佳的 IG 文章後，才知道原來醫療險有這麼多眉角！顧問很有耐心地幫我規劃，現在終於有完整的保障了。',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=Friendly%20young%20Asian%20woman%20portrait%20smiling%20warmly%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20approachable%20and%20trustworthy%20appearance&width=200&height=200&seq=testimonial-baojia-1&orientation=squarish'
  },
  {
    name: '阿傑',
    role: '35歲新手爸爸',
    content: '寶寶出生後才發現要買的保險好多！保家佳用很簡單的方式讓我了解兒童保險該怎麼買，也幫我省下不少保費。真的很推薦！',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=Young%20Asian%20professional%20man%20portrait%20smiling%20confidently%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20modern%20father%20appearance&width=200&height=200&seq=testimonial-baojia-2&orientation=squarish'
  },
  {
    name: '雅婷',
    role: '28歲小資族',
    content: '預算有限但又想要有保障，保家佳教我如何用最少的錢買到最需要的保險。現在每個月保費不到 3000 元，但保障很完整！',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=Creative%20young%20Asian%20woman%20portrait%20smiling%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20friendly%20appearance&width=200&height=200&seq=testimonial-baojia-3&orientation=squarish'
  },
  {
    name: '志明',
    role: '42歲企業主',
    content: '經營公司多年，一直沒有好好規劃保險。保家佳不只幫我做個人保障，也協助規劃員工團保，非常專業！',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=Professional%20Asian%20businessman%20portrait%20in%20business%20attire%20smiling%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20executive%20appearance&width=200&height=200&seq=testimonial-baojia-4&orientation=squarish'
  },
  {
    name: '佩君',
    role: '38歲家庭主婦',
    content: '之前買了很多儲蓄險，但醫療保障卻不足。保家佳幫我重新檢視保單，調整成更適合我們家的配置。理賠時也很快速！',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=Warm%20Asian%20woman%20portrait%20smiling%20kindly%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20caring%20mother%20appearance&width=200&height=200&seq=testimonial-baojia-5&orientation=squarish'
  },
  {
    name: '建宏',
    role: '50歲準退休族',
    content: '開始規劃退休生活，保家佳用很清楚的試算讓我知道需要準備多少退休金。現在對未來更有信心了！',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=Mature%20Asian%20man%20portrait%20smiling%20confidently%2C%20simple%20clean%20background%2C%20professional%20headshot%20photography%20style%2C%20natural%20lighting%2C%20experienced%20professional%20appearance&width=200&height=200&seq=testimonial-baojia-6&orientation=squarish'
  }
];

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">客戶真實分享</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            聽聽他們與保家佳的故事
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover object-top mr-3 sm:mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</h4>
                  <p className="text-gray-500 text-xs sm:text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-400 text-base sm:text-lg"></i>
                ))}
              </div>
              
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
