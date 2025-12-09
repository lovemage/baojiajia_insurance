import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Props {
  onBack: () => void;
}

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

export default function SystemSettingsEditor({ onBack }: Props) {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingBot, setTestingBot] = useState(false);
  
  // 表單狀態
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .in('setting_key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_notifications_enabled']);

      if (error) throw error;

      setSettings(data || []);
      
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
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('載入設定失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { setting_key: 'telegram_bot_token', setting_value: telegramBotToken },
        { setting_key: 'telegram_chat_id', setting_value: telegramChatId },
        { setting_key: 'telegram_notifications_enabled', setting_value: notificationsEnabled.toString() }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">系統設定</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← 返回
        </button>
      </div>

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
