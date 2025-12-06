import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

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
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 hidden xl:block">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm lg:text-base text-gray-700 hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  登出
                </button>
                {user.user_metadata.avatar_url && (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm cursor-pointer"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                登入會員
              </button>
            )}
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
                
                <div className="pt-2 border-t border-gray-100 mt-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 py-2 px-2">
                        {user.user_metadata.avatar_url && (
                          <img 
                            src={user.user_metadata.avatar_url} 
                            alt="avatar" 
                            className="w-8 h-8 rounded-full border border-gray-200"
                          />
                        )}
                        <span className="text-sm text-gray-600 truncate">{user.email}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer px-2"
                      >
                        登出
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleLogin();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 py-2 text-sm text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded transition-colors cursor-pointer px-2"
                    >
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                      登入會員
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
