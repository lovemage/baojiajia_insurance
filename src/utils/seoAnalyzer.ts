export interface SeoAnalysisResult {
  score: number; // 0-100
  checks: SeoCheck[];
}

export interface SeoCheck {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
}

export class SeoAnalyzer {
  static analyze(
    title: string,
    description: string,
    content: string,
    keyword: string
  ): SeoAnalysisResult {
    const checks: SeoCheck[] = [];
    let passedChecks = 0;
    let totalWeights = 0;

    // Helper to add check
    const addCheck = (
      id: string,
      label: string,
      condition: boolean,
      passMsg: string,
      failMsg: string,
      weight: number = 1,
      isWarning: boolean = false
    ) => {
      totalWeights += weight;
      if (condition) {
        passedChecks += weight;
        checks.push({ id, label, status: 'pass', message: passMsg });
      } else {
        checks.push({
          id,
          label,
          status: isWarning ? 'warning' : 'fail',
          message: failMsg
        });
      }
    };

    // 1. Title Length (Chinese characters count differently, usually 25-30 chars is good, approx 50-60 bytes)
    // Simplified: 10-40 chars
    addCheck(
      'title-length',
      '標題長度',
      title.length >= 10 && title.length <= 40,
      '標題長度適中',
      `標題長度為 ${title.length} 字，建議 10-40 字之間`,
      2
    );

    // 2. Description Length (Excerpt)
    // Simplified: 60-160 chars
    addCheck(
      'desc-length',
      '摘要/描述長度',
      description.length >= 60 && description.length <= 160,
      '摘要長度適中',
      `摘要長度為 ${description.length} 字，建議 60-160 字之間`,
      2
    );

    // 3. Content Length
    // Chinese content should be at least 600 chars for good depth
    const plainTextContent = content.replace(/<[^>]*>/g, '');
    addCheck(
      'content-length',
      '文章內容長度',
      plainTextContent.length >= 500,
      '文章內容長度足夠',
      `文章內容目前 ${plainTextContent.length} 字，建議至少 500 字以利 SEO`,
      3
    );

    // 4. Keyword in Title
    if (keyword) {
      addCheck(
        'keyword-title',
        '標題包含關鍵字',
        title.includes(keyword),
        '標題包含關鍵字',
        '建議標題中包含焦點關鍵字',
        3
      );

      // 5. Keyword in Description
      addCheck(
        'keyword-desc',
        '摘要包含關鍵字',
        description.includes(keyword),
        '摘要包含關鍵字',
        '建議摘要中包含焦點關鍵字',
        2
      );

      // 6. Keyword in Content
      addCheck(
        'keyword-content',
        '內容包含關鍵字',
        plainTextContent.includes(keyword),
        '內容包含關鍵字',
        '建議文章內容中包含焦點關鍵字',
        3
      );
    } else {
       checks.push({
          id: 'keyword-missing',
          label: '焦點關鍵字',
          status: 'warning',
          message: '未設定焦點關鍵字，無法進行關鍵字分析'
        });
    }

    // 7. Subheadings (H2, H3)
    const hasH2 = content.includes('<h2');
    addCheck(
      'subheadings',
      '使用副標題 (H2)',
      hasH2,
      '已使用 H2 標籤',
      '建議使用 H2 標籤來組織文章結構',
      2
    );

    // 8. Internal/External Links (Basic check)
    const hasLinks = content.includes('<a href=');
    addCheck(
      'links',
      '包含連結',
      hasLinks,
      '文章包含連結',
      '建議加入內部或外部連結以增加權威性',
      1,
      true
    );

    // 9. Images exist
    const hasImages = content.includes('<img');
    addCheck(
      'images',
      '包含圖片',
      hasImages,
      '文章包含圖片',
      '建議加入圖片以豐富內容',
      1,
      true
    );

    // Calculate Score
    // Adjust total weights if keyword is missing
    const score = Math.round((passedChecks / totalWeights) * 100);

    return {
      score: isNaN(score) ? 0 : score,
      checks
    };
  }
}
