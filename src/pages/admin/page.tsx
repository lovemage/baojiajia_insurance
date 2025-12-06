import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ServiceItemEditor from './components/ServiceItemEditor';
import ServiceDetailEditor from './components/ServiceDetailEditor';
import HomepageEditor from './components/HomepageEditor';
import FeaturesEditor from './components/FeaturesEditor';
import TestimonialsEditor from './components/TestimonialsEditor';
import BlogEditor from './components/BlogEditor';
import AboutEditor from './components/AboutEditor';
import ContactEditor from './components/ContactEditor';
import NavigationEditor from './components/NavigationEditor';
import SiteSettingsEditor from './components/SiteSettingsEditor';
import StatisticsEditor from './components/StatisticsEditor';
import CategoryManager from './components/CategoryManager';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

type EditMode = 'list' | 'service-item' | 'service-detail' | 'homepage' | 'features' | 'testimonials' | 'blog' | 'about' | 'contact' | 'navigation' | 'site-settings' | 'statistics' | 'blog-categories';

export default function AdminPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('service_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (service: ServiceItem) => {
    setSelectedService(service);
    setEditMode('service-item');
  };

  const handleEditDetail = (service: ServiceItem) => {
    setSelectedService(service);
    setEditMode('service-detail');
  };

  const handleBack = () => {
    setEditMode('list');
    setSelectedService(null);
    fetchServices();
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('service_items')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('更新狀態失敗，請稍後再試');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = services.findIndex(s => s.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === services.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentService = services[currentIndex];
    const targetService = services[targetIndex];

    try {
      const { error: error1 } = await supabase
        .from('service_items')
        .update({ display_order: targetService.display_order })
        .eq('id', currentService.id);

      const { error: error2 } = await supabase
        .from('service_items')
        .update({ display_order: currentService.display_order })
        .eq('id', targetService.id);

      if (error1 || error2) throw error1 || error2;
      fetchServices();
    } catch (error) {
      console.error('Error reordering services:', error);
      alert('調整順序失敗，請稍後再試');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // Render different editors based on mode
  if (editMode === 'service-item' && selectedService) {
    return <ServiceItemEditor service={selectedService} onBack={handleBack} />;
  }

  if (editMode === 'service-detail' && selectedService) {
    return <ServiceDetailEditor service={selectedService} onBack={handleBack} />;
  }

  if (editMode === 'homepage') {
    return <HomepageEditor onBack={handleBack} />;
  }

  if (editMode === 'features') {
    return <FeaturesEditor onBack={handleBack} />;
  }

  if (editMode === 'testimonials') {
    return <TestimonialsEditor onBack={handleBack} />;
  }

  if (editMode === 'blog') {
    return <BlogEditor onBack={handleBack} />;
  }

  if (editMode === 'about') {
    return <AboutEditor onBack={handleBack} />;
  }

  if (editMode === 'contact') {
    return <ContactEditor onBack={handleBack} />;
  }

  if (editMode === 'navigation') {
    return <NavigationEditor onBack={handleBack} />;
  }

  if (editMode === 'site-settings') {
    return <SiteSettingsEditor onBack={handleBack} />;
  }

  if (editMode === 'statistics') {
    return <StatisticsEditor onBack={handleBack} />;
  }

  if (editMode === 'blog-categories') {
    return <CategoryManager onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <i className="ri-dashboard-line text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">後台管理系統</h1>
                <p className="text-xs text-gray-500">網站內容管理</p>
              </div>
            </div>
            
            {/* 登出按鈕 */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <i className="ri-logout-box-line"></i>
              <span>登出</span>
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">內容管理後台</h1>
                <p className="text-gray-600">管理網站所有內容、圖片和文字</p>
              </div>
              <div className="w-16 h-16 bg-teal-500 rounded-xl flex items-center justify-center">
                <i className="ri-settings-3-line text-3xl text-white"></i>
              </div>
            </div>
          </div>

          {/* Management Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Homepage Content */}
            <button
              onClick={() => setEditMode('homepage')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-home-4-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">首頁內容</h3>
              <p className="text-sm text-gray-600">編輯首頁 Hero 區塊和行動呼籲</p>
            </button>

            {/* Navigation */}
            <button
              onClick={() => setEditMode('navigation')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-menu-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">導航選單</h3>
              <p className="text-sm text-gray-600">管理頂部導航選單項目</p>
            </button>

            {/* Site Settings */}
            <button
              onClick={() => setEditMode('site-settings')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-settings-4-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">網站設定</h3>
              <p className="text-sm text-gray-600">管理 Logo 和社群媒體連結</p>
            </button>

            {/* Features */}
            <button
              onClick={() => setEditMode('features')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-star-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">為什麼選擇我們</h3>
              <p className="text-sm text-gray-600">管理特色項目和優勢</p>
            </button>

            {/* Testimonials */}
            <button
              onClick={() => setEditMode('testimonials')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-chat-quote-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">客戶見證</h3>
              <p className="text-sm text-gray-600">管理客戶評價和推薦</p>
            </button>

            {/* Statistics */}
            <button
              onClick={() => setEditMode('statistics')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-bar-chart-box-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">統計數據</h3>
              <p className="text-sm text-gray-600">管理關於我們頁面的數字</p>
            </button>

            {/* Blog */}
            <button
              onClick={() => setEditMode('blog')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-article-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">知識專區</h3>
              <p className="text-sm text-gray-600">管理部落格文章內容</p>
            </button>

            {/* Blog Categories */}
            <button
              onClick={() => setEditMode('blog-categories')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-folder-settings-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">文章分類管理</h3>
              <p className="text-sm text-gray-600">新增、編輯或刪除文章分類</p>
            </button>

            {/* About */}
            <button
              onClick={() => setEditMode('about')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-team-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">關於我們</h3>
              <p className="text-sm text-gray-600">編輯公司介紹和團隊資訊</p>
            </button>

            {/* Contact */}
            <button
              onClick={() => setEditMode('contact')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-contacts-line text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">聯絡資訊</h3>
              <p className="text-sm text-gray-600">更新聯絡方式和地址</p>
            </button>
          </div>

          {/* Service Items Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">服務項目管理</h2>
            <p className="text-gray-600 mb-6">管理服務項目的內容、順序和顯示狀態</p>
          </div>

          {/* Service List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">順序</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">服務項目</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">描述</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">狀態</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {services.map((service, index) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium">{service.display_order}</span>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleReorder(service.id, 'up')}
                              disabled={index === 0}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              <i className="ri-arrow-up-s-line text-lg"></i>
                            </button>
                            <button
                              onClick={() => handleReorder(service.id, 'down')}
                              disabled={index === services.length - 1}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              <i className="ri-arrow-down-s-line text-lg"></i>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className={`${service.icon} text-lg text-white`}></i>
                          </div>
                          <span className="font-medium text-gray-900">{service.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">{service.description}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(service.id, service.is_active)}
                          className="cursor-pointer transition-all hover:scale-105"
                          title={service.is_active ? '點擊停用' : '點擊啟用'}
                        >
                          {service.is_active ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium whitespace-nowrap">
                              <i className="ri-checkbox-circle-fill"></i>
                              已啟用
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium whitespace-nowrap">
                              <i className="ri-close-circle-fill"></i>
                              已停用
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditItem(service)}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-edit-line mr-1"></i>
                            編輯項目
                          </button>
                          <button
                            onClick={() => handleEditDetail(service)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-file-text-line mr-1"></i>
                            編輯內容
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
