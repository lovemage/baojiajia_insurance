import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from './ImageUpload';
import { uploadToCloudinary } from '../../../lib/cloudinary';

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

interface Props {
  onBack: () => void;
}

export default function BlogEditor({ onBack }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // 初始化編輯器內容
  useEffect(() => {
    if (editingPost && contentEditableRef.current && !isInitialized.current) {
      contentEditableRef.current.innerHTML = editingPost.content;
      isInitialized.current = true;
    }
  }, [editingPost]);

  // 當切換編輯的文章時，重置初始化標記
  useEffect(() => {
    isInitialized.current = false;
  }, [editingPost?.id]);

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
      is_active: false
    });
    setIsNewPost(true);
  };

  const handleSave = async () => {
    if (!editingPost) return;

    setSaving(true);
    try {
      if (isNewPost) {
        // Insert new post
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            title: editingPost.title,
            excerpt: editingPost.excerpt,
            category: editingPost.category,
            author: editingPost.author,
            published_at: editingPost.published_at,
            read_time: editingPost.read_time,
            image_url: editingPost.image_url,
            content: editingPost.content,
            is_featured: editingPost.is_featured,
            is_active: editingPost.is_active
          });

        if (error) throw error;
      } else {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: editingPost.title,
            excerpt: editingPost.excerpt,
            category: editingPost.category,
            author: editingPost.author,
            published_at: editingPost.published_at,
            read_time: editingPost.read_time,
            image_url: editingPost.image_url,
            content: editingPost.content,
            is_featured: editingPost.is_featured,
            is_active: editingPost.is_active
          })
          .eq('id', editingPost.id);

        if (error) throw error;
      }
      
      setEditingPost(null);
      setIsNewPost(false);
      fetchPosts();
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('儲存失敗，請稍後再試');
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
  };

  const handleCancel = () => {
    setEditingPost(null);
    setIsNewPost(false);
  };

  // Rich text editor functions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentEditableRef.current?.focus();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadToCloudinary(file);
        if (file.type.startsWith('video/')) {
          const videoHtml = `<video src="${url}" controls style="max-width: 100%; display: block; margin: 10px 0;"></video><br/>`;
          execCommand('insertHTML', videoHtml);
        } else {
          execCommand('insertImage', url);
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('上傳失敗');
      }
    }
    e.target.value = '';
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  const changeFontSize = (size: string) => {
    execCommand('fontSize', size);
  };

  const changeTextColor = () => {
    const color = prompt('請輸入顏色代碼（例如：#FF0000）：');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const handleContentChange = () => {
    if (contentEditableRef.current && editingPost) {
      setEditingPost({
        ...editingPost,
        content: contentEditableRef.current.innerHTML
      });
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

  if (editingPost) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={handleImageUpload}
                  accept="image/*,video/*"
                />
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  文章內容
                </label>
                
                {/* Toolbar */}
                <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-3 flex flex-wrap gap-2">
                  {/* Font Size */}
                  <select
                    onChange={(e) => changeFontSize(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded cursor-pointer text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>字體大小</option>
                    <option value="1">極小</option>
                    <option value="2">小</option>
                    <option value="3">正常</option>
                    <option value="4">中</option>
                    <option value="5">大</option>
                    <option value="6">極大</option>
                    <option value="7">超大</option>
                  </select>

                  <div className="w-px h-8 bg-gray-300"></div>

                  {/* Text Formatting */}
                  <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="粗體"
                  >
                    <i className="ri-bold"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="斜體"
                  >
                    <i className="ri-italic"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('underline')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="底線"
                  >
                    <i className="ri-underline"></i>
                  </button>
                  <button
                    type="button"
                    onClick={changeTextColor}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="文字顏色"
                  >
                    <i className="ri-font-color"></i>
                  </button>

                  <div className="w-px h-8 bg-gray-300"></div>

                  {/* Alignment */}
                  <button
                    type="button"
                    onClick={() => execCommand('justifyLeft')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="靠左對齊"
                  >
                    <i className="ri-align-left"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('justifyCenter')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="置中對齊"
                  >
                    <i className="ri-align-center"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('justifyRight')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="靠右對齊"
                  >
                    <i className="ri-align-right"></i>
                  </button>

                  <div className="w-px h-8 bg-gray-300"></div>

                  {/* Lists */}
                  <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="項目符號"
                  >
                    <i className="ri-list-unordered"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('insertOrderedList')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="編號清單"
                  >
                    <i className="ri-list-ordered"></i>
                  </button>

                  <div className="w-px h-8 bg-gray-300"></div>

                  {/* Heading */}
                  <button
                    type="button"
                    onClick={() => execCommand('formatBlock', '<h2>')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm font-semibold"
                    title="大標題"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('formatBlock', '<h3>')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm font-semibold"
                    title="小標題"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand('formatBlock', '<p>')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer text-sm"
                    title="段落"
                  >
                    P
                  </button>

                  <div className="w-px h-8 bg-gray-300"></div>

                  {/* Image */}
                  <button
                    type="button"
                    onClick={insertImage}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="插入圖片/影片"
                  >
                    <i className="ri-image-add-line"></i>
                  </button>

                  <div className="w-px h-8 bg-gray-300"></div>

                  {/* Clear Formatting */}
                  <button
                    type="button"
                    onClick={() => execCommand('removeFormat')}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                    title="清除格式"
                  >
                    <i className="ri-format-clear"></i>
                  </button>
                </div>

                {/* Content Editable Area */}
                <div
                  ref={contentEditableRef}
                  contentEditable
                  onInput={handleContentChange}
                  dir="ltr"
                  className="w-full min-h-[400px] px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-left"
                  style={{
                    maxWidth: '100%',
                    overflowWrap: 'break-word',
                    direction: 'ltr',
                    textAlign: 'left'
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  <i className="ri-information-line mr-1"></i>
                  提示：點擊「插入圖片」按鈕可以上傳圖片或影片
                </p>
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
