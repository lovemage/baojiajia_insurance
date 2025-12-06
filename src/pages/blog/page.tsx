import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string;
  read_time: string;
  image_url: string;
  content: string;
  is_featured: boolean;
  is_active: boolean;
}

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const categoryNames = data?.map(c => c.name) || [];
      setCategories(['全部', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['全部', '保險基礎', '醫療保障', '理財規劃', '理賠實務', '案例分享']);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchCategory = selectedCategory === '全部' || post.category === selectedCategory;
    const matchSearch = searchKeyword === '' || 
      post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      post.category.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.is_featured);
  const recentPosts = blogPosts.slice(0, 5);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">保險知識分享</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            用淺顯易懂的方式，讓保險不再艱澀難懂
          </p>
          <a 
            href="https://www.instagram.com/baojia_jia/" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-white hover:text-white/80 transition-colors cursor-pointer"
          >
            <i className="ri-instagram-line text-xl sm:text-2xl mr-2"></i>
            <span className="text-sm sm:text-base md:text-lg">追蹤 @baojia_jia 獲取更多保險知識</span>
          </a>
        </div>
      </section>

      <section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* 左側主要內容區 */}
            <div className="lg:col-span-2">
              {/* 搜尋欄位 */}
              <div className="mb-6 sm:mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜尋文章標題、內容或分類..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 pr-12 border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:border-teal-600 transition-colors"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                    <i className="ri-search-line text-gray-400 text-lg sm:text-xl"></i>
                  </div>
                </div>
              </div>

              {/* 分類篩選 */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* 文章列表 */}
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {filteredPosts.map((post) => (
                    <Link 
                      key={post.id}
                      to={`/blog/${post.id}`}
                      className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                    >
                      <div className="relative h-44 sm:h-48 overflow-hidden">
                        <img 
                          src={post.image_url || 'https://readdy.ai/api/search-image?query=Insurance%20education%20concept%20with%20friendly%20advisor%20explaining%20to%20young%20person%2C%20bright%20modern%20setting%2C%20clean%20background%2C%20professional%20photography%20showing%20learning%20and%20understanding&width=800&height=500&seq=blog-default&orientation=landscape'}
                          alt={post.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                          <span className="bg-teal-600 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDate(post.published_at)}</span>
                          <span className="flex items-center">
                            <i className="ri-time-line mr-1"></i>
                            {post.read_time}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <i className="ri-search-line text-5xl"></i>
                  </div>
                  <p className="text-gray-500 text-base sm:text-lg">找不到符合條件的文章</p>
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      setSelectedCategory('全部');
                    }}
                    className="mt-4 px-6 py-2.5 bg-teal-600 text-white rounded-full text-sm font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    清除篩選條件
                  </button>
                </div>
              )}
            </div>

            {/* 右側側邊欄 */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6 sm:space-y-8">
                {/* 近期文章 */}
                {recentPosts.length > 0 && (
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-time-line text-teal-600 text-xl"></i>
                      </div>
                      近期文章
                    </h3>
                    <div className="space-y-4">
                      {recentPosts.map((post) => (
                        <Link
                          key={post.id}
                          to={`/blog/${post.id}`}
                          className="block group cursor-pointer"
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                              <img
                                src={post.image_url || 'https://readdy.ai/api/search-image?query=Insurance%20education%20concept%20with%20friendly%20advisor%20explaining%20to%20young%20person%2C%20bright%20modern%20setting%2C%20clean%20background%2C%20professional%20photography%20showing%20learning%20and%20understanding&width=200&height=200&seq=blog-recent-default&orientation=squarish'}
                                alt={post.title}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">
                                {post.title}
                              </h4>
                              <div className="flex items-center text-xs text-gray-500">
                                <span>{formatDate(post.published_at)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 精選文章 */}
                {featuredPosts.length > 0 && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl sm:rounded-2xl p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-star-fill text-teal-600 text-xl"></i>
                      </div>
                      精選文章
                    </h3>
                    <div className="space-y-4">
                      {featuredPosts.map((post, index) => (
                        <Link
                          key={post.id}
                          to={`/blog/${post.id}`}
                          className="block bg-white rounded-lg sm:rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-teal-600 rounded-full text-white text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                                {post.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                  {post.category}
                                </span>
                                <span className="flex items-center">
                                  <i className="ri-time-line mr-1"></i>
                                  {post.read_time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
