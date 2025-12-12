import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from './ImageUpload';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar_url: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  onBack: () => void;
}

export default function TestimonialsEditor({ onBack }: Props) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTestimonial) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          name: editingTestimonial.name,
          role: editingTestimonial.role,
          content: editingTestimonial.content,
          rating: editingTestimonial.rating,
          avatar_url: editingTestimonial.avatar_url,
          is_active: editingTestimonial.is_active
        })
        .eq('id', editingTestimonial.id);

      if (error) throw error;
      
      setEditingTestimonial(null);
      fetchTestimonials();
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling testimonial status:', error);
      alert('更新狀態失敗，請稍後再試');
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

  if (editingTestimonial) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">編輯客戶見證</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    客戶姓名
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.name}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    身份/職業
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.role}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  評價內容
                </label>
                <textarea
                  value={editingTestimonial.content}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  評分 (1-5星)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEditingTestimonial({ ...editingTestimonial, rating: star })}
                      className="cursor-pointer"
                    >
                      <i className={`${star <= editingTestimonial.rating ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'} text-3xl`}></i>
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">{editingTestimonial.rating} 星</span>
                </div>
              </div>

              <ImageUpload
                value={editingTestimonial.avatar_url}
                onChange={(url) => setEditingTestimonial({ ...editingTestimonial, avatar_url: url })}
                label="頭像圖片網址"
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingTestimonial.is_active}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, is_active: e.target.checked })}
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer">
                  顯示此客戶見證
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setEditingTestimonial(null)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {saving ? '儲存中...' : '儲存變更'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">客戶見證管理</h1>
              <p className="text-gray-600">管理客戶評價和推薦內容</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar_url}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover object-top mr-3"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(testimonial.id, testimonial.is_active)}
                  className="cursor-pointer"
                >
                  {testimonial.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                      <i className="ri-checkbox-circle-fill"></i>
                      顯示
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap">
                      <i className="ri-close-circle-fill"></i>
                      隱藏
                    </span>
                  )}
                </button>
              </div>

              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-400"></i>
                ))}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-4">{testimonial.content}</p>

              <button
                onClick={() => setEditingTestimonial(testimonial)}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-edit-line mr-2"></i>
                編輯
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
