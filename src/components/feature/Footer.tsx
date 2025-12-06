import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ fontFamily: '"Pacifico", serif' }}>保家佳</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed max-w-md">
            用知識守護每個家庭，讓保險不再艱澀難懂
          </p>
          <div className="flex space-x-3 sm:space-x-4">
            <a 
              href="https://www.instagram.com/baojia_jia/" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <i className="ri-instagram-line text-lg sm:text-xl"></i>
            </a>
            <a 
              href="https://www.facebook.com/Baojiajia.tw" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <i className="ri-facebook-fill text-lg sm:text-xl"></i>
            </a>
            <a 
              href="https://lin.ee/Z7HOfYBe" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <i className="ri-line-fill text-lg sm:text-xl"></i>
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
            © 2024 保險服務平台. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-teal-400 text-xs sm:text-sm transition-colors cursor-pointer">
              隱私政策
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-teal-400 text-xs sm:text-sm transition-colors cursor-pointer">
              服務條款
            </Link>
            <a href="https://readdy.ai/?origin=logo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-400 text-xs sm:text-sm transition-colors cursor-pointer">
              Powered by Readdy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
