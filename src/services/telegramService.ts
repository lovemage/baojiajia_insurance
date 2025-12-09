import { supabase } from '../lib/supabase';

interface TelegramSettings {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

interface NotificationData {
  type: 'questionnaire_submitted' | 'pdf_downloaded' | 'admin_pdf_downloaded';
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  memberCity?: string;
  planType?: 'adult' | 'child';
  timestamp: Date;
  adminUser?: string;
}

/**
 * 獲取 Telegram 設定
 */
async function getTelegramSettings(): Promise<TelegramSettings | null> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['telegram_bot_token', 'telegram_chat_id', 'telegram_notifications_enabled']);

    if (error) {
      console.error('Error fetching Telegram settings:', error);
      return null;
    }

    const settings: any = {};
    data?.forEach(item => {
      settings[item.setting_key] = item.setting_value;
    });

    return {
      botToken: settings.telegram_bot_token || '',
      chatId: settings.telegram_chat_id || '',
      enabled: settings.telegram_notifications_enabled === 'true'
    };
  } catch (error) {
    console.error('Error getting Telegram settings:', error);
    return null;
  }
}

/**
 * 格式化通知訊息
 */
function formatNotificationMessage(data: NotificationData): string {
  const timestamp = data.timestamp.toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const planTypeText = data.planType === 'child' ? '兒童版' : '成人版';

  switch (data.type) {
    case 'questionnaire_submitted':
      return `🆕 <b>新會員問卷提交</b>

👤 <b>姓名：</b>${data.memberName}
📧 <b>Email：</b>${data.memberEmail}
📱 <b>電話：</b>${data.memberPhone || '未提供'}
🏠 <b>居住地：</b>${data.memberCity || '未提供'}
📋 <b>方案類型：</b>${planTypeText}
⏰ <b>提交時間：</b>${timestamp}

💡 會員已完成保障需求分析問卷，可至後台查看詳細資料。`;

    case 'pdf_downloaded':
      return `📄 <b>會員下載分析報告</b>

👤 <b>姓名：</b>${data.memberName}
📧 <b>Email：</b>${data.memberEmail}
📱 <b>電話：</b>${data.memberPhone || '未提供'}
🏠 <b>居住地：</b>${data.memberCity || '未提供'}
📋 <b>方案類型：</b>${planTypeText}
⏰ <b>下載時間：</b>${timestamp}

✅ 會員已成功下載保障需求分析報告 PDF。`;

    case 'admin_pdf_downloaded':
      return `🔧 <b>管理員下載會員報告</b>

👤 <b>會員姓名：</b>${data.memberName}
📧 <b>會員 Email：</b>${data.memberEmail}
👨‍💼 <b>操作管理員：</b>${data.adminUser || '未知'}
📋 <b>方案類型：</b>${planTypeText}
⏰ <b>下載時間：</b>${timestamp}

📊 管理員已從後台下載會員的分析報告。`;

    default:
      return `📢 <b>系統通知</b>

⏰ <b>時間：</b>${timestamp}
📝 <b>內容：</b>未知的通知類型`;
  }
}

/**
 * 發送 Telegram 通知
 */
export async function sendTelegramNotification(data: NotificationData): Promise<boolean> {
  try {
    const settings = await getTelegramSettings();
    
    if (!settings || !settings.enabled || !settings.botToken || !settings.chatId) {
      console.log('Telegram notifications disabled or not configured');
      return false;
    }

    const message = formatNotificationMessage(data);
    
    const response = await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Telegram API error:', result);
      return false;
    }

    console.log('Telegram notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * 測試 Telegram 連接
 */
export async function testTelegramConnection(botToken: string, chatId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🤖 保家佳系統測試訊息\n\n這是一則測試訊息，確認 Telegram Bot 設定正確。',
        parse_mode: 'HTML'
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Telegram connection test failed:', error);
    return false;
  }
}
