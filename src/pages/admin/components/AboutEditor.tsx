import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ImageUpload from './ImageUpload';
import RichTextEditor from '../../../components/RichTextEditor';

interface AboutContent {
  id: string;
  mission_title: string;
  mission_content: string;
  hero_image?: string;
  instagram_followers: string;
  clients_served: string;
  satisfaction_rate: string;
  articles_published: string;
  team_visible: boolean;
  intro_visible: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

interface CoreValue {
  id: string;
  icon: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  onBack: () => void;
}

type EditMode = 'list' | 'content' | 'team' | 'values';

export default function AboutEditor({ onBack }: Props) {
  const [editMode, setEditMode] = useState<EditMode>('list');
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);
  const [editingValue, setEditingValue] = useState<CoreValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentRes, teamRes, valuesRes] = await Promise.all([
        supabase.from('about_content').select('*').maybeSingle(),
        supabase.from('team_members').select('*').order('display_order', { ascending: true }),
        supabase.from('core_values').select('*').order('display_order', { ascending: true })
      ]);

      if (contentRes.error) console.warn('About content fetch warning:', contentRes.error);
      
      // Handle empty content by using default structure or null
      if (contentRes.data) {
        setAboutContent(contentRes.data);
      } else {
        // Init empty content if table is empty (prevent crash)
        setAboutContent({
          id: '',
          mission_title: '',
          mission_content: '',
          hero_image: '',
          instagram_followers: '0',
          clients_served: '0',
          satisfaction_rate: '0',
          articles_published: '0',
          team_visible: false,
          intro_visible: false
        });
      }

      setTeamMembers(teamRes.data || []);
      setCoreValues(valuesRes.data || []);
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    if (!aboutContent) return;

    setSaving(true);
    try {
      // Construct payload dynamically, checking which columns exist
      const payload: any = {};
      
      // Basic fields that should exist
      const basicFields = [
        'mission_title', 'mission_content', 'team_visible', 'intro_visible',
        'instagram_followers', 'clients_served', 'satisfaction_rate', 'articles_published'
      ];

      // Test which basic fields exist and add them to payload
      for (const field of basicFields) {
        try {
          const { data: columnTest, error: columnError } = await supabase
            .from('about_content')
            .select(field)
            .limit(1);
          
          if (!columnError && columnTest !== null) {
            payload[field] = aboutContent[field as keyof AboutContent];
          }
        } catch (e) {
          console.log(`Column ${field} does not exist, skipping...`);
        }
      }

      // Special handling for hero_image
      try {
        const { data: columnTest, error: columnError } = await supabase
          .from('about_content')
          .select('hero_image')
          .limit(1);
        
        // Only include hero_image if column exists and has a value
        if (!columnError && columnTest !== null && aboutContent.hero_image) {
          payload.hero_image = aboutContent.hero_image;
        }
      } catch (e) {
        console.log('hero_image column does not exist, skipping...');
      }

      console.log('Sending payload:', payload);

      if (aboutContent.id) {
        const { error } = await supabase
          .from('about_content')
          .update(payload)
          .eq('id', aboutContent.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from('about_content')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        if (data) setAboutContent(prev => ({ ...prev!, ...data }));
      }

      alert('儲存成功！');
      setEditMode('list');
    } catch (error) {
      console.error('Error saving about content:', error);
      alert('儲存失敗，請稍後再試: ' + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTeam = async () => {
    if (!editingTeam) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          name: editingTeam.name,
          role: editingTeam.role,
          description: editingTeam.description,
          image_url: editingTeam.image_url,
          is_active: editingTeam.is_active
        })
        .eq('id', editingTeam.id);

      if (error) throw error;
      
      setEditingTeam(null);
      fetchData();
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveValue = async () => {
    if (!editingValue) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('core_values')
        .update({
          icon: editingValue.icon,
          title: editingValue.title,
          description: editingValue.description,
          is_active: editingValue.is_active
        })
        .eq('id', editingValue.id);

      if (error) throw error;
      
      setEditingValue(null);
      fetchData();
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving core value:', error);
      alert('儲存失敗，請稍後再試');
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

  // Editing team member
  if (editingTeam) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">編輯團隊成員</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">姓名</label>
                  <input
                    type="text"
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">職位</label>
                  <input
                    type="text"
                    value={editingTeam.role}
                    onChange={(e) => setEditingTeam({ ...editingTeam, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">簡介</label>
                <textarea
                  value={editingTeam.description}
                  onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>
              <ImageUpload
                value={editingTeam.image_url}
                onChange={(url) => setEditingTeam({ ...editingTeam, image_url: url })}
                label="照片網址"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="team_active"
                  checked={editingTeam.is_active}
                  onChange={(e) => setEditingTeam({ ...editingTeam, is_active: e.target.checked })}
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="team_active" className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer">
                  顯示此成員
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setEditingTeam(null)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                onClick={handleSaveTeam}
                disabled={saving}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 cursor-pointer whitespace-nowrap"
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Editing core value
  if (editingValue) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">編輯核心價值</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">圖示</label>
                <input
                  type="text"
                  value={editingValue.icon}
                  onChange={(e) => setEditingValue({ ...editingValue, icon: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="ri-book-open-line"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">標題</label>
                <input
                  type="text"
                  value={editingValue.title}
                  onChange={(e) => setEditingValue({ ...editingValue, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">描述</label>
                <textarea
                  value={editingValue.description}
                  onChange={(e) => setEditingValue({ ...editingValue, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="value_active"
                  checked={editingValue.is_active}
                  onChange={(e) => setEditingValue({ ...editingValue, is_active: e.target.checked })}
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="value_active" className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer">
                  啟用此價值
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setEditingValue(null)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                onClick={handleSaveValue}
                disabled={saving}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 cursor-pointer whitespace-nowrap"
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content editing
  if (editMode === 'content' && aboutContent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">編輯關於我們內容</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">區塊顯示設定</h3>
                    <p className="text-xs text-gray-500">控制此區塊在前台是否顯示</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => setAboutContent({ ...aboutContent, intro_visible: !aboutContent.intro_visible })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                        aboutContent.intro_visible ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          aboutContent.intro_visible ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {aboutContent.intro_visible ? '顯示中' : '已隱藏'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero Image Field */}
              <ImageUpload
                label="頁首主圖 (Hero Image)"
                value={aboutContent.hero_image || ''}
                onChange={(url) => setAboutContent({ ...aboutContent, hero_image: url })}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">使命標題</label>
                <input
                  type="text"
                  value={aboutContent.mission_title}
                  onChange={(e) => setAboutContent({ ...aboutContent, mission_title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">使命內容</label>
                <RichTextEditor
                  value={aboutContent.mission_content}
                  onChange={(content) => setAboutContent({ ...aboutContent, mission_content: content })}
                  placeholder="請輸入使命內容..."
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">IG 粉絲數</label>
                  <input
                    type="text"
                    value={aboutContent.instagram_followers}
                    onChange={(e) => setAboutContent({ ...aboutContent, instagram_followers: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">服務客戶</label>
                  <input
                    type="text"
                    value={aboutContent.clients_served}
                    onChange={(e) => setAboutContent({ ...aboutContent, clients_served: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">滿意度</label>
                  <input
                    type="text"
                    value={aboutContent.satisfaction_rate}
                    onChange={(e) => setAboutContent({ ...aboutContent, satisfaction_rate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">文章數</label>
                  <input
                    type="text"
                    value={aboutContent.articles_published}
                    onChange={(e) => setAboutContent({ ...aboutContent, articles_published: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setEditMode('list')}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                取消
              </button>
              <button
                onClick={handleSaveContent}
                disabled={saving}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 cursor-pointer whitespace-nowrap"
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Team members list
  if (editMode === 'team') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">團隊成員管理</h1>
              <button
                onClick={() => setEditMode('list')}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                返回
              </button>
            </div>

            {aboutContent && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">團隊區塊顯示設定</h3>
                  <p className="text-xs text-gray-500">控制整個團隊區塊在前台是否顯示</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={async () => {
                      const newValue = !aboutContent.team_visible;
                      setAboutContent({ ...aboutContent, team_visible: newValue });
                      // Save immediately for better UX
                      try {
                        await supabase
                          .from('about_content')
                          .update({ team_visible: newValue })
                          .eq('id', aboutContent.id);
                      } catch (e) {
                        console.error('Error updating team visibility', e);
                        setAboutContent({ ...aboutContent, team_visible: !newValue }); // Revert
                        alert('更新失敗');
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                      aboutContent.team_visible ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        aboutContent.team_visible ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {aboutContent.team_visible ? '顯示中' : '已隱藏'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img src={member.image_url} alt={member.name} className="w-full h-64 object-cover object-top" />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-teal-600 mb-2">{member.role}</p>
                  <p className="text-xs text-gray-600 mb-4 line-clamp-3">{member.description}</p>
                  <button
                    onClick={() => setEditingTeam(member)}
                    className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    編輯
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Core values list
  if (editMode === 'values') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">核心價值管理</h1>
              <button
                onClick={() => setEditMode('list')}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                返回
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value) => (
              <div key={value.id} className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${value.icon} text-3xl text-teal-600`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{value.description}</p>
                <button
                  onClick={() => setEditingValue(value)}
                  className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  編輯
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main menu
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">關於我們管理</h1>
              <p className="text-gray-600">編輯公司介紹和團隊資訊</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setEditMode('content')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all text-left group cursor-pointer"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="ri-file-text-line text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">公司介紹</h3>
            <p className="text-sm text-gray-600">編輯使命、願景和統計數據</p>
          </button>

          <button
            onClick={() => setEditMode('team')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all text-left group cursor-pointer"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="ri-team-line text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">團隊成員</h3>
            <p className="text-sm text-gray-600">管理團隊成員資訊</p>
          </button>

          <button
            onClick={() => setEditMode('values')}
            className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all text-left group cursor-pointer"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <i className="ri-heart-line text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">核心價值</h3>
            <p className="text-sm text-gray-600">編輯核心價值觀</p>
          </button>
        </div>
      </div>
    </div>
  );
}
