
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ServiceItemEditor from './components/ServiceItemEditor';
import ServiceDetailEditor from './components/ServiceDetailEditor';
import HomepageEditor from './components/HomepageEditor';
import FeaturesEditor from './components/FeaturesEditor';
import TestimonialsEditor from './components/TestimonialsEditor';
import BlogEditor from './components/BlogEditor';
import AboutEditor from './components/AboutEditor';
import MemberManager from './components/MemberManager';
import ContactEditor from './components/ContactEditor';
import NavigationEditor from './components/NavigationEditor';
import SiteSettingsEditor from './components/SiteSettingsEditor';
import StatisticsEditor from './components/StatisticsEditor';
import CategoryManager from './components/CategoryManager';
import ChangePassword from './components/ChangePassword';
import ServiceManager from './components/ServiceManager';
import PdfTemplateEditor from './components/PdfTemplateEditor';

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

type EditMode = 'list' | 'service-item' | 'service-detail' | 'homepage' | 'features' | 'testimonials' | 'blog' | 'about' | 'member-manager' | 'navigation' | 'site-settings' | 'statistics' | 'blog-categories' | 'change-password' | 'pdf-template';

export default function AdminPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { id: 'homepage', label: '首頁內容', icon: 'ri-home-4-line' },
    { id: 'navigation', label: '導航選單', icon: 'ri-menu-line' },
    { id: 'list', label: '服務項目', icon: 'ri-list-check' },
    { id: 'features', label: '特色優勢', icon: 'ri-star-line' },
    { id: 'testimonials', label: '客戶見證', icon: 'ri-chat-quote-line' },
    { id: 'blog', label: '知識專區', icon: 'ri-article-line' },
    { id: 'blog-categories', label: '文章分類', icon: 'ri-folder-settings-line' },
    { id: 'about', label: '關於我們', icon: 'ri-team-line' },
    { id: 'member-manager', label: '會員資訊', icon: 'ri-user-search-line' },
    { id: 'pdf-template', label: 'PDF 報告模板', icon: 'ri-file-pdf-line' },
    { id: 'site-settings', label: '網站設定', icon: 'ri-settings-4-line' },
    { id: 'statistics', label: '統計數據', icon: 'ri-bar-chart-box-line' },
  ];

  const renderContent = () => {
    switch (editMode) {
      case 'service-item':
        return selectedService ? <ServiceItemEditor service={selectedService} onBack={handleBack} /> : null;
      case 'service-detail':
        return selectedService ? <ServiceDetailEditor service={selectedService} onBack={handleBack} /> : null;
      case 'homepage':
        return <HomepageEditor onBack={handleBack} />;
      case 'features':
        return <FeaturesEditor onBack={handleBack} />;
      case 'testimonials':
        return <TestimonialsEditor onBack={handleBack} />;
      case 'blog':
        return <BlogEditor onBack={handleBack} />;
      case 'about':
        return <AboutEditor onBack={handleBack} />;
      case 'member-manager':
        return <MemberManager />;
      case 'navigation':
        return <NavigationEditor onBack={handleBack} />;
      case 'site-settings':
        return <SiteSettingsEditor onBack={handleBack} />;
      case 'statistics':
        return <StatisticsEditor onBack={handleBack} />;
      case 'blog-categories':
        return <CategoryManager onBack={handleBack} />;
      case 'pdf-template':
        return <PdfTemplateEditor onBack={handleBack} />;
      case 'change-password':
        return <ChangePassword onBack={handleBack} />;
      case 'list':
      default:
        return <ServiceManager onEditItem={handleEditItem} onEditDetail={handleEditDetail} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-white shadow-xl z-20 transition-all duration-300 flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-dashboard-line text-white"></i>
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-gray-800 whitespace-nowrap">後台管理系統</span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setEditMode(item.id as EditMode);
                if (item.id === 'list') setSelectedService(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                (editMode === item.id) || (item.id === 'list' && (editMode === 'service-item' || editMode === 'service-detail'))
                  ? 'bg-teal-50 text-teal-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${!isSidebarOpen && 'justify-center'}`}
              title={!isSidebarOpen ? item.label : ''}
            >
              <i className={`${item.icon} text-xl ${
                (editMode === item.id) || (item.id === 'list' && (editMode === 'service-item' || editMode === 'service-detail'))
                  ? 'text-teal-600' 
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}></i>
              {isSidebarOpen && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => setEditMode('change-password')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
              editMode === 'change-password'
                ? 'bg-teal-50 text-teal-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${!isSidebarOpen && 'justify-center'}`}
            title={!isSidebarOpen ? '修改密碼' : ''}
          >
            <i className={`ri-lock-password-line text-xl ${
              editMode === 'change-password' ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
            }`}></i>
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">修改密碼</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group ${!isSidebarOpen && 'justify-center'}`}
            title={!isSidebarOpen ? '登出' : ''}
          >
            <i className="ri-logout-box-line text-xl text-gray-400 group-hover:text-red-500"></i>
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">登出</span>}
          </button>
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-teal-600 transition-colors z-30 hidden md:flex"
        >
          <i className={`ri-arrow-${isSidebarOpen ? 'left' : 'right'}-s-line`}></i>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
