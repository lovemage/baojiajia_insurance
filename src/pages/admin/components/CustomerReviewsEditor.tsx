import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface CustomerReview {
  id: string;
  user_name: string | null;
  user_email: string | null;
  avatar_url: string | null;
  role: string | null;
  rating: number;
  content: string;
  source: string;
  is_approved: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface Props {
  onBack: () => void;
}

export default function CustomerReviewsEditor({ onBack }: Props) {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CustomerReview>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('is_approved', { ascending: true })
        .order('is_active', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data as any) || []);
    } catch (e) {
      console.error('Error fetching customer reviews:', e);
      alert('載入評價失敗');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) => {
      const text = `${r.user_name ?? ''} ${r.user_email ?? ''} ${r.role ?? ''} ${r.content ?? ''}`.toLowerCase();
      return text.includes(q);
    });
  }, [reviews, search]);

  const updateReview = async (id: string, patch: Partial<CustomerReview>) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('customer_reviews').update(patch).eq('id', id);
      if (error) throw error;
      await fetchReviews();
    } catch (e) {
      console.error('Error updating review:', e);
      alert('更新失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (r: CustomerReview) => {
    setEditingId(r.id);
    setEditForm({ user_name: r.user_name, role: r.role, content: r.content, rating: r.rating, avatar_url: r.avatar_url });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('customer_reviews').update({
        user_name: editForm.user_name,
        role: editForm.role,
        content: editForm.content,
        rating: editForm.rating,
        avatar_url: editForm.avatar_url
      }).eq('id', id);
      if (error) throw error;
      setEditingId(null);
      setEditForm({});
      await fetchReviews();
    } catch (e) {
      console.error('Error saving review edit:', e);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const addNewReview = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('customer_reviews').insert({
        user_name: '新評價',
        role: '',
        content: '請編輯此評價內容',
        rating: 5,
        source: 'admin',
        is_approved: true,
        is_active: false,
        display_order: reviews.length + 1
      });
      if (error) throw error;
      await fetchReviews();
    } catch (e) {
      console.error('Error adding review:', e);
      alert('新增失敗');
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('確定要刪除此評價？此操作無法復原。')) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('customer_reviews').delete().eq('id', id);
      if (error) throw error;
      await fetchReviews();
    } catch (e) {
      console.error('Error deleting review:', e);
      alert('刪除失敗');
    } finally {
      setSaving(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText('https://baojiajia.tw/?review=open');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      alert('複製失敗，請手動複製：https://baojiajia.tw/?review=open');
    }
  };

  const bulkReorder = async () => {
    setSaving(true);
    try {
      const activeApproved = reviews
        .filter((r) => r.is_active && r.is_approved)
        .sort((a, b) => a.display_order - b.display_order);

      for (let i = 0; i < activeApproved.length; i++) {
        const r = activeApproved[i];
        if (r.display_order === i + 1) continue;
        const { error } = await supabase
          .from('customer_reviews')
          .update({ display_order: i + 1 })
          .eq('id', r.id);
        if (error) throw error;
      }

      await fetchReviews();
      alert('已重新排序');
    } catch (e) {
      console.error('Error reordering reviews:', e);
      alert('重新排序失敗');
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">客戶評價（真實評價系統）</h1>
              <p className="text-gray-600">審核後才會在首頁公開顯示</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={addNewReview}
                disabled={saving}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                新增評價
              </button>
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <i className={`${copiedLink ? 'ri-check-line' : 'ri-link'} mr-2`}></i>
                {copiedLink ? '已複製！' : '複製邀請連結'}
              </button>
              <button
                onClick={bulkReorder}
                disabled={saving}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <i className="ri-sort-asc mr-2"></i>
                重新排序
              </button>
              <button
                onClick={fetchReviews}
                disabled={saving}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <i className="ri-refresh-line mr-2"></i>
                刷新
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                返回
              </button>
            </div>
          </div>

          <div className="mt-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋姓名、Email、內容..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={r.avatar_url || 'https://readdy.ai/api/search-image?query=Minimal%20profile%20avatar%20icon%2C%20flat%20design%2C%20simple%20neutral%20background&width=120&height=120&seq=default-avatar&orientation=squarish'}
                    alt={r.user_name || 'avatar'}
                    className="w-12 h-12 rounded-full object-cover object-top"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{r.user_name || '匿名'}</div>
                    <div className="text-xs text-gray-500">{r.user_email || ''}</div>
                    <div className="text-xs text-gray-500">{r.role || ''}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {r.source === 'seed' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 whitespace-nowrap">種子資料</span>
                  )}
                  {r.source === 'admin' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">管理員建立</span>
                  )}
                  {r.source === 'site' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">用戶提交</span>
                  )}
                  {r.source !== 'seed' && r.source !== 'admin' && r.source !== 'site' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">{r.source}</span>
                  )}
                  {r.is_approved ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 whitespace-nowrap">已審核</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap">待審核</span>
                  )}
                  {r.is_active ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700 whitespace-nowrap">公開</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">不公開</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex">
                  {[...Array(r.rating)].map((_, i) => (
                    <i key={i} className="ri-star-fill text-yellow-400"></i>
                  ))}
                </div>
                <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
              </div>

              {editingId === r.id ? (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">姓名</label>
                      <input type="text" value={editForm.user_name ?? ''} onChange={(e) => setEditForm({ ...editForm, user_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">身份/職業</label>
                      <input type="text" value={editForm.role ?? ''} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">評分</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setEditForm({ ...editForm, rating: star })} className="cursor-pointer">
                          <i className={`${star <= (editForm.rating ?? 5) ? 'ri-star-fill text-yellow-400' : 'ri-star-line text-gray-300'} text-xl`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">評價內容</label>
                    <textarea value={editForm.content ?? ''} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">頭像網址（可選）</label>
                    <input type="text" value={editForm.avatar_url ?? ''} onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => saveEdit(r.id)} disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 whitespace-nowrap">儲存</button>
                    <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 whitespace-nowrap">取消</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{r.content}</div>

                  <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">排序（公開用）</label>
                        <input
                          type="number"
                          value={r.display_order}
                          onChange={(e) => updateReview(r.id, { display_order: Number(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          disabled={saving}
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          disabled={saving}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          <i className="ri-edit-line mr-1"></i>編輯
                        </button>
                        <button
                          type="button"
                          onClick={() => updateReview(r.id, { is_approved: !r.is_approved, is_active: r.is_approved ? r.is_active : false })}
                          disabled={saving}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {r.is_approved ? '取消審核' : '通過審核'}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateReview(r.id, { is_active: !r.is_active })}
                          disabled={saving || !r.is_approved}
                          className="flex-1 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {r.is_active ? '下架' : '上架'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteReview(r.id)}
                          disabled={saving}
                          className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>

                    {!r.is_approved && (
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        尚未審核：需要先「通過審核」後才能上架公開。
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
