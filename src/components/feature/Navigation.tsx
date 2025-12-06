import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          <Link to="/" className="cursor-pointer flex items-center">
            <img 
              src="https://static.readdy.ai/image/84ccad05498cbded7957a6723736d89e/8861a0f1b7a73a71b741ceabeff4ad12.png" 
              alt="保家佳" 
              className="h-10 sm:h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            <Link to="/" className="text-sm lg:text-base text-gray-700 hover:text-teal-600 transition-colors cursor-pointer whitespace-nowrap">
              首頁
            </Link>
            <Link to="/beginner" className="text-sm lg:text-base text-gray-700 hover:text-teal-600 transition-colors cursor-pointer whitespace-nowrap">
              保險新手村
            </Link>
            <Link to="/analysis" className="text-sm lg:text-base text-gray-700 hover:text-teal-600 transition-colors cursor-pointer whitespace-nowrap">
              需求分析 DIY
            </Link>
            <Link to="/blog" className="text-sm lg:text-base text-gray-700 hover:text-teal-600 transition-colors cursor-pointer whitespace-nowrap">
              知識專區
            </Link>
            <Link to="/about" className="text-sm lg:text-base text-gray-700 hover:text-teal-600 transition-colors cursor-pointer whitespace-nowrap">
              關於我們
            </Link>
            <Link to="/contact" className="text-sm lg:text-base text-gray-700 hover:text-teal-600 transition-colors cursor-pointer whitespace-nowrap">
              聯絡我們
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl text-gray-700`}></i>
          </button>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-14 sm:top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-100">
              <div className="px-4 py-3 space-y-2">
                <Link 
                  to="/" 
                  className="block py-2 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  首頁
                </Link>
                <Link 
                  to="/beginner" 
                  className="block py-2 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  保險新手村
                </Link>
                <Link 
                  to="/analysis" 
                  className="block py-2 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  需求分析 DIY
                </Link>
                <Link 
                  to="/blog" 
                  className="block py-2 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  知識專區
                </Link>
                <Link 
                  to="/about" 
                  className="block py-2 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  關於我們
                </Link>
                <Link 
                  to="/contact" 
                  className="block py-2 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  聯絡我們
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
