
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

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

interface ServiceManagerProps {
  onEditItem: (service: any) => void;
  onEditDetail: (service: any) => void;
}

export default function ServiceManager({ onEditItem, onEditDetail }: ServiceManagerProps) {
  const [services, setServices] = useState<ServiceItem[]>([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">服務項目管理</h2>
        <p className="text-gray-600">管理服務項目的內容、順序和顯示狀態</p>
      </div>

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
                        onClick={() => onEditItem(service)}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-edit-line mr-1"></i>
                        編輯項目
                      </button>
                      <button
                        onClick={() => onEditDetail(service)}
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
  );
}
