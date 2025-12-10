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
  questionnaireData?: any; // 新增：詳細問卷資料
}

// 選項映射表 (與前端保持一致)
const OPTIONS_MAP: any = {
  insuranceKnowledge: {
    'A': '完全清楚',
    'B': '大概知道，但細節不清楚',
    'C': '不太清楚，別人幫我規劃的',
    'D': '完全不了解',
    'E': '沒有規劃過保障'
  },
  policyCheckExpectations: {
    'A': '降低保費，提高保障',
    'B': '避免買到「地雷保單」',
    'C': '避免您重複或過度投保',
    'D': '審視保障內容符合您的個人需求'
  },
  monthlyBudget: {
    'A': '3000 以下',
    'B': '3000~5000 元',
    'C': '5000~10000 元',
    'D': '10000 以上'
  },
  gender: {
    'male': '男',
    'female': '女'
  },
  roomType: {
    'single': '單人房',
    'double': '雙人房',
    'health-insurance': '健保房'
  },
  surgerySubsidy: {
    'full': '全額負擔 (30-40萬)',
    'recommended': '建議額度 (20-30萬)',
    'basic': '基本額度 (10-20萬)'
  }
};

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
    
    if (data && Array.isArray(data) && data.length > 0) {
      data.forEach((item: any) => {
        if (item && item.setting_key && typeof item.setting_value !== 'undefined') {
          settings[item.setting_key] = item.setting_value;
        }
      });
    }

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
 * 格式化問卷詳細內容
 */
function formatQuestionnaireDetails(data: any): string {
  if (!data) return '';

  const safeGet = (obj: any, key: string, def = '-') => obj?.[key] || def;
  const getLabel = (category: string, value: any) => OPTIONS_MAP[category]?.[value] || value || '-';
  
  const expectations = (data.policyCheckExpectations || [])
    .map((v: string) => OPTIONS_MAP.policyCheckExpectations[v] || v)
    .join('、');

  return `
📋 <b>問卷詳細內容：</b>
------------------
<b>【基本資料】</b>
• 性別：${getLabel('gender', data.gender)}
• 生日：${data.birthDate || '-'}
• 職業：${data.occupation || '-'}

<b>【醫療需求】</b>
• 病房：${getLabel('roomType', data.roomType)}
• 日額：${(data.hospitalDaily || 0).toLocaleString()} 元
• 手術：${getLabel('surgerySubsidy', data.surgerySubsidy)}

<b>【重症與長照】</b>
• 薪資損失：${Math.round((data.salaryLoss || 0) / 10000)} 萬/月
• 生活開銷：${Math.round((data.livingExpense || 0) * 12 / 10000)} 萬/年
• 治療費用：${Math.round((data.treatmentCost || 0) / 10000)} 萬
• 長照需求：${Math.round((data.longTermCare || 0) / 10000)} 萬/月

<b>【財務狀況】</b>
• 家人照顧：${(data.familyCare || 0).toLocaleString()} 元
• 個人負債：${(data.personalDebt || 0).toLocaleString()} 元
• 月收入：${Math.round((data.monthlyIncome || 0) / 10000)} 萬

<b>【其他評估】</b>
• 保險了解：${getLabel('insuranceKnowledge', data.insuranceKnowledge)}
• 健診期望：${expectations}
• 每月預算：${getLabel('monthlyBudget', data.monthlyBudget)}`;
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
  const details = data.questionnaireData ? formatQuestionnaireDetails(data.questionnaireData) : '';

  switch (data.type) {
    case 'questionnaire_submitted':
      return `🆕 <b>新會員問卷提交</b>

👤 <b>姓名：</b>${data.memberName}
📧 <b>Email：</b>${data.memberEmail}
📱 <b>電話：</b>${data.memberPhone || '未提供'}
🏠 <b>居住地：</b>${data.memberCity || '未提供'}
📋 <b>方案類型：</b>${planTypeText}
⏰ <b>提交時間：</b>${timestamp}
${details}

💡 可至後台查看完整資料或下載 CSV。`;

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
