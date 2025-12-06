import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  onBack: () => void;
}

export default function NavigationEditor({ onBack }: Props) {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching navigation items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      if (isAdding) {
        const { error } = await supabase
          .from('navigation_items')
          .insert([editingItem]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('navigation_items')
          .update(editingItem)
          .eq('id', editingItem.id);
        if (error) throw error;
      }

      alert('儲存成功！');
      setEditingItem(null);
      setIsAdding(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving navigation item:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個導航項目嗎？')) return;

    try {
      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('刪除成功！');
      fetchItems();
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('更新狀態失敗');
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === items.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentItem = items[currentIndex];
    const targetItem = items[targetIndex];

    try {
      await supabase
        .from('navigation_items')
        .update({ display_order: targetItem.display_order })
        .eq('id', currentItem.id);

      await supabase
        .from('navigation_items')
        .update({ display_order: currentItem.display_order })
        .eq('id', targetItem.id);

      fetchItems();
    } catch (error) {
      console.error('Error reordering:', error);
      alert('調整順序失敗');
    }
  };

  const handleAddNew = () => {
    setEditingItem({
      id: '',
      label: '',
      path: '',
      display_order: items.length + 1,
      is_active: true
    });
    setIsAdding(true);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">導航選單管理</h1>
              <p className="text-gray-600">管理網站頂部導航選單的項目和順序</p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              返回
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap mb-6"
          >
            <i className="ri-add-line mr-2"></i>
            新增導航項目
          </button>

          {editingItem && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {isAdding ? '新增導航項目' : '編輯導航項目'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    顯示文字
                  </label>
                  <input
                    type="text"
                    value={editingItem.label}
                    onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="例如：首頁"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    連結路徑
                  </label>
                  <input
                    type="text"
                    value={editingItem.path}
                    onChange={(e) => setEditingItem({ ...editingItem, path: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="例如：/"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    顯示順序
                  </label>
                  <input
                    type="number"
                    value={editingItem.display_order}
                    onChange={(e) => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingItem.is_active}
                    onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    啟用此導航項目
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {saving ? '儲存中...' : '儲存'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsAdding(false);
                    }}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">順序</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">顯示文字</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">連結路徑</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">狀態</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.display_order}</span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleReorder(item.id, 'up')}
                            disabled={index === 0}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-teal-600 disabled:opacity-30 cursor-pointer"
                          >
                            <i className="ri-arrow-up-s-line"></i>
                          </button>
                          <button
                            onClick={() => handleReorder(item.id, 'down')}
                            disabled={index === items.length - 1}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-teal-600 disabled:opacity-30 cursor-pointer"
                          >
                            <i className="ri-arrow-down-s-line"></i>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{item.label}</td>
                    <td className="px-6 py-4 text-gray-600">{item.path}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(item.id, item.is_active)}
                        className="cursor-pointer"
                      >
                        {item.is_active ? (
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
                          onClick={() => {
                            setEditingItem(item);
                            setIsAdding(false);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-edit-line mr-1"></i>
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-delete-bin-line mr-1"></i>
                          刪除
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
  );
}
