import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from './ImageUpload';
import { SeoAnalyzer, type SeoAnalysisResult } from '../../../utils/seoAnalyzer';
import RichTextEditor from '../../../components/RichTextEditor';

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
  // SEO Fields
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

interface Props {
  onBack: () => void;
}

export default function BlogEditor({ onBack }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'editor' | 'html' | 'preview'>('editor');
  
  // SEO State (Analysis Only)
  const [focusKeyword, setFocusKeyword] = useState('');
  const [seoResult, setSeoResult] = useState<SeoAnalysisResult>({ score: 0, checks: [] });

  // Update focus keyword when meta keywords change (optional convenience)
  useEffect(() => {
    if (editingPost?.meta_keywords && !focusKeyword) {
      const firstKeyword = editingPost.meta_keywords.split(',')[0].trim();
      if (firstKeyword) setFocusKeyword(firstKeyword);
    }
  }, [editingPost?.meta_keywords]);

  useEffect(() => {
    if (editingPost) {
      // Analyze using Meta fields if available, otherwise fallback to standard fields
      const analyzeTitle = editingPost.meta_title || editingPost.title;
      const analyzeDesc = editingPost.meta_description || editingPost.excerpt;
      
      const result = SeoAnalyzer.analyze(
        analyzeTitle,
        analyzeDesc,
        editingPost.content,
        focusKeyword
      );
      setSeoResult(result);
    }
  }, [
    editingPost?.title, 
    editingPost?.excerpt, 
    editingPost?.content, 
    editingPost?.meta_title, 
    editingPost?.meta_description, 
    focusKeyword
  ]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data?.map(c => c.name) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['保險基礎', '醫療保障', '理財規劃', '理賠實務', '案例分享']);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPost({
      id: '',
      title: '',
      excerpt: '',
      category: categories[0] || '保險基礎',
      author: '',
      published_at: new Date().toISOString().split('T')[0],
      read_time: '5分鐘',
      image_url: '',
      content: '',
      is_featured: false,
      is_active: false,
      slug: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setIsNewPost(true);
    setFocusKeyword('');
  };

  const handleSave = async () => {
    if (!editingPost) return;

    setSaving(true);
    try {
      const postData = {
        title: editingPost.title,
        excerpt: editingPost.excerpt,
        category: editingPost.category,
        author: editingPost.author,
        published_at: editingPost.published_at,
        read_time: editingPost.read_time,
        image_url: editingPost.image_url,
        content: editingPost.content,
        is_featured: editingPost.is_featured,
        is_active: editingPost.is_active,
        slug: editingPost.slug,
        meta_title: editingPost.meta_title,
        meta_description: editingPost.meta_description,
        meta_keywords: editingPost.meta_keywords
      };

      if (isNewPost) {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
      }
      
      setEditingPost(null);
      setIsNewPost(false);
      fetchPosts();
      alert('儲存成功！');
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      if (error.message?.includes('column "slug" does not exist') || error.message?.includes('meta_')) {
        alert('儲存失敗：資料庫缺少 SEO 欄位。請聯絡管理員執行資料庫更新。');
      } else {
        alert('儲存失敗，請稍後再試');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error toggling post status:', error);
      alert('更新狀態失敗，請稍後再試');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsNewPost(false);
    // Initialize focus keyword from meta keywords if available
    if (post.meta_keywords) {
      const first = post.meta_keywords.split(',')[0].trim();
      setFocusKeyword(first);
    } else {
      setFocusKeyword('');
    }
  };

  const handleCancel = () => {
    setEditingPost(null);
    setIsNewPost(false);
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

  if (editingPost) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isNewPost ? '新增文章' : '編輯文章'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  文章標題
                </label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="輸入文章標題"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  文章摘要
                </label>
                <textarea
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="輸入文章摘要（顯示在列表頁）"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    分類
                  </label>
                  <select
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-8 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    作者
                  </label>
                  <input
                    type="text"
                    value={editingPost.author}
                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="作者名稱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    閱讀時間
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      （讀者閱讀此文章所需時間，例如：5分鐘）
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editingPost.read_time}
                    onChange={(e) => setEditingPost({ ...editingPost, read_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="5分鐘"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    發布日期
                  </label>
                  <input
                    type="date"
                    value={editingPost.published_at}
                    onChange={(e) => setEditingPost({ ...editingPost, published_at: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <ImageUpload
                  value={editingPost.image_url}
                  onChange={(url) => setEditingPost({ ...editingPost, image_url: url })}
                  label="封面圖片網址"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    文章內容
                  </label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('editor')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all cursor-pointer ${
                        viewMode === 'editor'
                          ? 'bg-white text-teal-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className="ri-edit-line mr-1"></i>
                      編輯
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('html')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all cursor-pointer ${
                        viewMode === 'html'
                          ? 'bg-white text-teal-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className="ri-code-line mr-1"></i>
                      HTML
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all cursor-pointer ${
                        viewMode === 'preview'
                          ? 'bg-white text-teal-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className="ri-eye-line mr-1"></i>
                      預覽
                    </button>
                  </div>
                </div>

                <div className="min-h-[400px]">
                  {viewMode === 'editor' && (
                    <RichTextEditor
                      value={editingPost.content}
                      onChange={(content) => setEditingPost({ ...editingPost, content })}
                      placeholder="請在此輸入文章內容..."
                    />
                  )}
                  
                  {viewMode === 'html' && (
                    <textarea
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      className="w-full h-[500px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                      placeholder="<html>...</html>"
                    />
                  )}

                  {viewMode === 'preview' && (
                    <div className="border border-gray-300 rounded-lg p-8 bg-white overflow-y-auto max-h-[600px]">
                      <article className="prose prose-lg max-w-none prose-teal">
                        <div dangerouslySetInnerHTML={{ __html: editingPost.content }} />
                      </article>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Settings & Analysis Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <i className="ri-seo-line mr-2 text-teal-600"></i>
                    SEO 設定與分析
                  </h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">SEO 分數：</span>
                    <div className={`text-2xl font-bold ${
                      seoResult.score >= 80 ? 'text-green-600' :
                      seoResult.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {seoResult.score}
                    </div>
                  </div>
                </div>

                {/* Database SEO Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta 標題 (Title)
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (建議 30-60 字，若空白將使用文章標題)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={editingPost.meta_title || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, meta_title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="例如：新生兒保險懶人包｜2024最新規劃攻略"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta 描述 (Description)
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (建議 120-160 字，若空白將使用文章摘要)
                      </span>
                    </label>
                    <textarea
                      value={editingPost.meta_description || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      placeholder="簡短描述這篇文章的內容，這段文字會出現在搜尋結果中..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      自訂網址 (Slug)
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (建議使用英文與連字符，例如：newborn-insurance-guide)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={editingPost.slug || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="newborn-insurance-guide"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meta 關鍵字 (Keywords)
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (以逗號分隔)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={editingPost.meta_keywords || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, meta_keywords: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="保險, 新生兒, 醫療險"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="mb-4">
                     <label className="block text-sm font-semibold text-gray-700 mb-2">
                      分析用焦點關鍵字 (Focus Keyword)
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (用於即時 SEO 分析，不影響儲存內容)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="輸入主要關鍵字進行分析"
                    />
                  </div>

                  <div className="space-y-3">
                    {seoResult.checks.map((check) => (
                      <div key={check.id} className="flex items-start">
                        <div className={`mt-0.5 mr-3 flex-shrink-0 ${
                          check.status === 'pass' ? 'text-green-500' :
                          check.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          <i className={
                            check.status === 'pass' ? 'ri-checkbox-circle-fill' :
                            check.status === 'warning' ? 'ri-error-warning-fill' : 'ri-close-circle-fill'
                          }></i>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                             check.status === 'pass' ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {check.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {check.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={editingPost.is_featured}
                    onChange={(e) => setEditingPost({ ...editingPost, is_featured: e.target.checked })}
                    className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="is_featured" className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer">
                    設為精選文章
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingPost.is_active}
                    onChange={(e) => setEditingPost({ ...editingPost, is_active: e.target.checked })}
                    className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer">
                    發布文章
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={handleCancel}
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">知識專區管理</h1>
              <p className="text-gray-600">管理部落格文章內容</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                新增文章
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">文章標題</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">分類</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">作者</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">精選</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">狀態</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 line-clamp-2 max-w-md">{post.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{post.published_at}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium whitespace-nowrap">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{post.author}</td>
                    <td className="px-6 py-4 text-center">
                      {post.is_featured && (
                        <i className="ri-star-fill text-yellow-400 text-xl"></i>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(post.id, post.is_active)}
                        className="cursor-pointer"
                      >
                        {post.is_active ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium whitespace-nowrap">
                            <i className="ri-checkbox-circle-fill"></i>
                            已發布
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium whitespace-nowrap">
                            <i className="ri-close-circle-fill"></i>
                            草稿
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(post)}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-edit-line mr-1"></i>
                        編輯
                      </button>
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
