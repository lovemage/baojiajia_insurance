import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { uploadToCloudinary } from '../../../lib/cloudinary';

interface Props {
  onBack: () => void;
}

export default function SystemSettingsEditor({ onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingBot, setTestingBot] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  
  // Telegram 表單狀態
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Analysis Icon 表單狀態
  const [adultIcon, setAdultIcon] = useState('');
  const [childIcon, setChildIcon] = useState('');

  // Customer Reviews
  const [reviewsSubmissionEnabled, setReviewsSubmissionEnabled] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .in('setting_key', [
          'telegram_bot_token', 
          'telegram_chat_id', 
          'telegram_notifications_enabled',
          'analysis_adult_icon',
          'analysis_child_icon',
          'reviews_submission_enabled'
        ]);

      if (error) throw error;
      
      // 設定表單初始值
      data?.forEach(setting => {
        switch (setting.setting_key) {
          case 'telegram_bot_token':
            setTelegramBotToken(setting.setting_value || '');
            break;
          case 'telegram_chat_id':
            setTelegramChatId(setting.setting_value || '');
            break;
          case 'telegram_notifications_enabled':
            setNotificationsEnabled(setting.setting_value === 'true');
            break;
          case 'analysis_adult_icon':
            setAdultIcon(setting.setting_value || '');
            break;
          case 'analysis_child_icon':
            setChildIcon(setting.setting_value || '');
            break;
          case 'reviews_submission_enabled':
            setReviewsSubmissionEnabled(setting.setting_value !== 'false');
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('載入設定失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'adult' | 'child') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    try {
      const url = await uploadToCloudinary(file);
      if (type === 'adult') {
        setAdultIcon(url);
      } else {
        setChildIcon(url);
      }
      alert('圖示上傳成功！');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上傳失敗');
    } finally {
      setUploadingIcon(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { setting_key: 'telegram_bot_token', setting_value: telegramBotToken, description: 'Telegram Bot API Token' },
        { setting_key: 'telegram_chat_id', setting_value: telegramChatId, description: 'Telegram Chat ID' },
        { setting_key: 'telegram_notifications_enabled', setting_value: notificationsEnabled.toString(), description: 'Enable Telegram notifications' },
        { setting_key: 'analysis_adult_icon', setting_value: adultIcon, description: '成人保險規劃圖示 URL' },
        { setting_key: 'analysis_child_icon', setting_value: childIcon, description: '幼兒保險規劃圖示 URL' },
        { setting_key: 'reviews_submission_enabled', setting_value: reviewsSubmissionEnabled.toString(), description: 'Enable/disable customer review submissions (login required)' }
      ];

      for (const update of updates) {
        // 先檢查是否存在
        const { data: existing } = await supabase
          .from('system_settings')
          .select('id')
          .eq('setting_key', update.setting_key)
          .single();

        if (existing) {
          // 存在則更新
          const { error } = await supabase
            .from('system_settings')
            .update({ setting_value: update.setting_value })
            .eq('setting_key', update.setting_key);
          if (error) throw error;
        } else {
          // 不存在則插入
          const { error } = await supabase
            .from('system_settings')
            .insert(update);
          if (error) throw error;
        }
      }

      alert('設定已儲存');
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('儲存設定失敗');
    } finally {
      setSaving(false);
    }
  };

  const testTelegramBot = async () => {
    if (!telegramBotToken || !telegramChatId) {
      alert('請先填寫 Bot Token 和 Chat ID');
      return;
    }

    setTestingBot(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: '🤖 保家佳系統測試訊息\n\n這是一則測試訊息，確認 Telegram Bot 設定正確。',
          parse_mode: 'HTML'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('✅ 測試成功！已發送測試訊息到 Telegram');
      } else {
        throw new Error(result.description || '發送失敗');
      }
    } catch (error) {
      console.error('Telegram test failed:', error);
      alert(`❌ 測試失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setTestingBot(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">系統設定</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          返回
        </button>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⭐</span>
          客戶真實評價設定
        </h2>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">開放送出評價</h3>
            <p className="text-sm text-gray-600">啟用後，前台會顯示「留下評價」，且使用者必須登入後才能送出（避免垃圾評價）</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reviewsSubmissionEnabled}
              onChange={(e) => setReviewsSubmissionEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '儲存中...' : '💾 儲存設定'}
          </button>
        </div>
      </div>

      {/* Analysis Icons Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🎨</span>
          分析頁面圖示設定
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Adult Icon */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">成人保險規劃圖示</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {adultIcon ? (
                  <img src={adultIcon} alt="Adult Icon" className="w-full h-full object-cover" />
                ) : (
                  <i className="ri-user-line text-4xl text-gray-400"></i>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={adultIcon}
                  onChange={(e) => setAdultIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                  placeholder="輸入圖片 URL"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleIconUpload(e, 'adult')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingIcon}
                  />
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
                    disabled={uploadingIcon}
                  >
                    {uploadingIcon ? '上傳中...' : '上傳圖片'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Child Icon */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">幼兒保險規劃圖示</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {childIcon ? (
                  <img src={childIcon} alt="Child Icon" className="w-full h-full object-cover" />
                ) : (
                  <i className="ri-parent-line text-4xl text-gray-400"></i>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={childIcon}
                  onChange={(e) => setChildIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                  placeholder="輸入圖片 URL"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleIconUpload(e, 'child')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingIcon}
                  />
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
                    disabled={uploadingIcon}
                  >
                    {uploadingIcon ? '上傳中...' : '上傳圖片'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📱</span>
          Telegram 通知設定
        </h2>
        
        <div className="space-y-6">
          {/* 啟用通知開關 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">啟用 Telegram 通知</h3>
              <p className="text-sm text-gray-600">會員填寫問卷或下載報告時發送通知</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Bot Token 設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telegram Bot Token <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
              placeholder="請輸入 Bot Token (例: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              從 @BotFather 獲取的 Bot Token
            </p>
          </div>

          {/* Chat ID 設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telegram Chat ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="請輸入 Chat ID (例: -1001234567890 或 123456789)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              個人聊天 ID 或群組 Chat ID（群組 ID 以 - 開頭）
            </p>
          </div>

          {/* 設定說明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 設定步驟：</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>與 @BotFather 對話創建新的 Bot，獲取 Bot Token</li>
              <li>將 Bot 加入您的群組或與 Bot 私聊</li>
              <li>使用 @userinfobot 獲取您的 Chat ID</li>
              <li>填寫上述資訊並點擊「測試連接」</li>
            </ol>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={testTelegramBot}
              disabled={testingBot || !telegramBotToken || !telegramChatId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {testingBot ? '測試中...' : '🧪 測試連接'}
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '儲存中...' : '💾 儲存設定'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
