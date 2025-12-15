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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Update focus keyword when meta keywords change (optional convenience)
  useEffect(() => {
    if (editingPost?.meta_keywords && !focusKeyword) {
      const keywords = editingPost.meta_keywords.trim();
      if (keywords) setFocusKeyword(keywords);
    }
  }, [editingPost?.meta_keywords]);

  const startSeoAnalysis = () => {
    if (!editingPost) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setHasAnalyzed(false);

    // Random duration between 8-12 seconds
    const duration = Math.floor(Math.random() * (12000 - 8000 + 1) + 8000);
    const interval = 100;
    const steps = duration / interval;
    const increment = 100 / steps;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        clearInterval(timer);
        setAnalysisProgress(100);
        
        // Perform analysis
        const analyzeTitle = editingPost.meta_title || editingPost.title;
        const analyzeDesc = editingPost.meta_description || editingPost.excerpt;
        
        const result = SeoAnalyzer.analyze(
          analyzeTitle,
          analyzeDesc,
          editingPost.content,
          focusKeyword
        );
        setSeoResult(result);
        setIsAnalyzing(false);
        setHasAnalyzed(true);
      } else {
        setAnalysisProgress(currentProgress);
      }
    }, interval);
  };

  const autoFillSeo = () => {
    if (!editingPost) return;
    
    // Simple heuristic to extract potential keywords from title
    const keywords = editingPost.title
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter(k => k.length >= 2)
      .slice(0, 5)
      .join(', ');

    setEditingPost({
      ...editingPost,
      meta_title: editingPost.title,
      meta_description: editingPost.excerpt,
      meta_keywords: keywords,
      slug: '' // User should probably define this manually to be safe, or we could auto-generate
    });
    
    // Also set focus keyword for analysis
    if (keywords) {
      setFocusKeyword(keywords);
    }
    
    alert('已自動填入 SEO 標題、描述與關鍵字。請檢查並微調。');
  };

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

      if (error) {
        console.error('Error fetching categories:', error);
        setCategories(['保險基礎', '醫療保障', '理財規劃', '理賠實務', '案例分享']);
        return;
      }
      
      setCategories((data && Array.isArray(data)) ? data.map((c: any) => c.name) : []);
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
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingPost({
      id: '',
      title: '',
      excerpt: '',
      category: categories[0] || '保險基礎',
      author: '保家佳',
      published_at: today,
      read_time: '8',
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
    setHasAnalyzed(false);
  };
  const handleSave = async () => {
    if (!editingPost) return;

    setSaving(true);
    try {
      const normalizedSlug = (editingPost.slug ?? '').trim() || null;
      const normalizedMetaTitle = (editingPost.meta_title ?? '').trim() || null;
      const normalizedMetaDescription = (editingPost.meta_description ?? '').trim() || null;
      const normalizedMetaKeywords = (editingPost.meta_keywords ?? '').trim() || null;

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
        slug: normalizedSlug,
        meta_title: normalizedMetaTitle,
        meta_description: normalizedMetaDescription,
        meta_keywords: normalizedMetaKeywords
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
      } else if (error?.code === '23505' || error?.status === 409) {
        alert('儲存失敗：資料有重複（可能是網址代稱 slug 已存在）。請更換 slug 後再試。');
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
    setHasAnalyzed(false);
    // Initialize focus keyword from meta keywords if available
    if (post.meta_keywords) {
      setFocusKeyword(post.meta_keywords.trim());
    } else {
      setFocusKeyword('');
    }
  };

  const handleDelete = async (post: BlogPost) => {
    const confirmDelete = window.confirm(
      `確定要永久刪除文章「${post.title}」嗎？\n\n此操作無法復原，文章將被永久刪除。`
    );
    
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      fetchPosts();
      alert('文章已成功刪除');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  const handleCancel = () => {
    setEditingPost(null);
    setIsNewPost(false);
  };

  const handleInsertTemplate = () => {
    if (!editingPost) return;
    
    const template = `<!DOCTYPE html>
<html lang="zh-Hant-TW" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    <meta name="keywords" content="2025保險規劃, 38歲男性保險, 家庭支柱保險, 月薪5萬保險, 定期壽險, 實支實付醫療險, 癌症險一次金, 雙十原則, 高CP值保單">
    <meta name="author" content="保家佳|保險理財知識分享平台">
    <meta name="robots" content="index, follow, max-image-preview:large">

    <!-- Canonical Tag (避免重複內容問題，請替換為此文章的最終發布網址) -->
    <link rel="canonical" href="[請替換為此文章的完整 URL, 例如: https://www.yourwebsite.com/blog/2025-insurance-guide-38yo]">

    <!-- ====================================================================
         Open Graph / Meta Data (針對 Facebook, Line, LinkedIn 社群分享優化)
         ==================================================================== -->
    <meta property="og:locale" content="zh_TW">
    <meta property="og:type" content="article">
    <meta property="og:title" content="2025成人保險規劃攻略：38歲家庭支柱，月薪5萬如何聰明買保險？(高CP值組合)">
    <meta property="og:description" content="2025年保險怎麼買？針對38歲「三明治族」爸爸，月薪5萬預算。教你捨棄人情保單，用定期險組合建立千萬保障。內附實戰保單範例。">
    <meta property="og:url" content="[請替換為此文章的完整 URL]">
    <meta property="og:site_name" content="[請替換為您的網站名稱]">
    <meta property="article:published_time" content="2024-12-06T12:00:00+08:00">
    <meta property="article:modified_time" content="2024-12-06T12:00:00+08:00">
    <meta property="article:section" content="保險理財">
    <meta property="article:tag" content="保險規劃">
    <meta property="article:tag" content="家庭理財">`;

    setEditingPost({
      ...editingPost,
      content: editingPost.content ? editingPost.content + '\n' + template : template
    });
    
    // Switch to HTML view to show the inserted code clearly
    setViewMode('html');
    alert('SEO 範本已插入！已自動切換至 HTML 模式以便查看與編輯。');
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
                    閱讀時間 (分鐘)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editingPost.read_time.replace(/[^0-9]/g, '')}
                      onChange={(e) => setEditingPost({ ...editingPost, read_time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                      placeholder="8"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-500 text-sm">分鐘</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    發布設定
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio text-teal-600"
                          name="publishType"
                          checked={new Date(editingPost.published_at) <= new Date()}
                          onChange={() => setEditingPost({ ...editingPost, published_at: new Date().toISOString().split('T')[0] })}
                        />
                        <span className="ml-2">立即發布</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio text-teal-600"
                          name="publishType"
                          checked={new Date(editingPost.published_at) > new Date()}
                          onChange={() => {
                            // Default to tomorrow if switching to scheduled
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            setEditingPost({ ...editingPost, published_at: tomorrow.toISOString().split('T')[0] });
                          }}
                        />
                        <span className="ml-2">預約發布</span>
                      </label>
                    </div>
                    
                    {new Date(editingPost.published_at) > new Date() && (
                      <input
                        type="date"
                        value={editingPost.published_at}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEditingPost({ ...editingPost, published_at: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    )}
                  </div>
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
                  <button
                    type="button"
                    onClick={handleInsertTemplate}
                    className="px-3 py-1 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-all cursor-pointer border border-purple-200 ml-2"
                    title="插入標準 SEO HTML 結構範本"
                  >
                    <i className="ri-code-s-slash-line mr-1"></i>
                    SEO 範本
                  </button>
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={autoFillSeo}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <i className="ri-magic-line mr-1"></i>
                      自動填入
                    </button>
                    <button
                      type="button"
                      onClick={startSeoAnalysis}
                      disabled={isAnalyzing}
                      className={`px-4 py-2 text-sm rounded-lg text-white transition-colors ${
                        isAnalyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                      }`}
                    >
                      {isAnalyzing ? '分析中...' : '開始分析'}
                    </button>
                  </div>
                </div>

                {/* Analysis Progress Bar */}
                {isAnalyzing && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>正在分析文章結構與關鍵字密度...</span>
                      <span>{Math.round(analysisProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-teal-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* SEO Score Display (Only show after analysis) */}
                {hasAnalyzed && !isAnalyzing && (
                  <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">SEO 分析結果</h4>
                      <p className="text-sm text-gray-500">根據最新的 Google 排名因素分析</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">總分：</span>
                      <div className={`text-3xl font-bold ${
                        seoResult.score >= 80 ? 'text-green-600' :
                        seoResult.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {seoResult.score}
                      </div>
                    </div>
                  </div>
                )}

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

                {hasAnalyzed && !isAnalyzing && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="mb-4">
                       <label className="block text-sm font-semibold text-gray-700 mb-2">
                        分析用關鍵字 (Keywords)
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          (用於 SEO 分析，可填多組並以逗號分隔，建議與 Meta 關鍵字一致)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={focusKeyword}
                        onChange={(e) => setFocusKeyword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="例如：保險, 新生兒保險, 新生兒保險規劃"
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
                )}
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
                <i className="ri-arrow-left-line mr-2"></i>
                返回文章列表
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
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              新增文章
            </button>
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
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">刪除</th>
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
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(post)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line mr-1"></i>
                        刪除
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
