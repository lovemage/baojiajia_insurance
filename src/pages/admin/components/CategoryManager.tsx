
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  onBack: () => void;
}

const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\-\u4e00-\u9fa5]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export default function CategoryManager({ onBack }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories((data || []) as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({ name: '', slug: '' });
    setSlugEditedManually(false);
    setIsNewCategory(true);
    setEditingCategory({
      id: '',
      name: '',
      slug: '',
      display_order: categories.length + 1,
      is_active: true
    });
  };

  const handleEdit = (category: Category) => {
    setFormData({ name: category.name, slug: category.slug });
    setSlugEditedManually(true);
    setEditingCategory(category);
    setIsNewCategory(false);
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      name: value,
      slug: slugEditedManually ? prev.slug : generateSlug(value)
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugEditedManually(true);
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(value)
    }));
  };

  const handleSave = async () => {
    if (!editingCategory || !formData.name.trim()) {
      alert('請輸入分類名稱');
      return;
    }

    const normalizedSlug = formData.slug ? generateSlug(formData.slug) : generateSlug(formData.name);
    if (!normalizedSlug) {
      alert('請輸入有效的網址代稱（slug）');
      return;
    }

    setSaving(true);
    try {
      if (isNewCategory) {
        const { error } = await supabase
          .from('blog_categories')
          .insert({
            name: formData.name,
            slug: normalizedSlug,
            display_order: categories.length + 1,
            is_active: true
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_categories')
          .update({ name: formData.name, slug: normalizedSlug })
          .eq('id', editingCategory.id);

        if (error) throw error;
      }

      setEditingCategory(null);
      setIsNewCategory(false);
      setSlugEditedManually(false);
      fetchCategories();
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_categories')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      alert('更新狀態失敗，請稍後再試');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此分類嗎？使用此分類的文章將不受影響。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
      alert('刪除成功！');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('刪除失敗，請稍後再試');
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

  if (editingCategory) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isNewCategory ? '新增分類' : '編輯分類'}
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                分類名稱
              </label>
                  <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="輸入分類名稱"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  URL 代稱 (Slug)
                </label>
                <span className="text-xs text-gray-500">僅限英數、中文與連字號</span>
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="例如：insurance-basics"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setIsNewCategory(false);
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">文章分類管理</h1>
              <p className="text-gray-600">管理知識專區的文章分類</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                新增分類
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                返回
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">分類名稱</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Slug</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">排序</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">狀態</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="px-2 py-1 bg-gray-100 rounded-md">{category.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {category.display_order}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(category.id, category.is_active)}
                        className="cursor-pointer"
                      >
                        {category.is_active ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium whitespace-nowrap">
                            <i className="ri-checkbox-circle-fill"></i>
                            啟用
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium whitespace-nowrap">
                            <i className="ri-close-circle-fill"></i>
                            停用
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-edit-line mr-1"></i>
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
