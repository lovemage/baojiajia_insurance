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
  private static normalizeKeywords(keywordOrKeywords: string | string[]): string[] {
    const rawList = Array.isArray(keywordOrKeywords) ? keywordOrKeywords : [keywordOrKeywords];
    const splitList = rawList
      .flatMap((k) => (k ?? '').split(','))
      .map((k) => k.trim())
      .filter(Boolean);

    // De-duplicate while preserving order
    const seen = new Set<string>();
    const result: string[] = [];
    for (const k of splitList) {
      const key = k.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(k);
      }
    }
    return result;
  }

  static analyze(
    title: string,
    description: string,
    content: string,
    keywordOrKeywords: string | string[]
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

    const rawKeywords = (Array.isArray(keywordOrKeywords) ? keywordOrKeywords : [keywordOrKeywords])
      .flatMap((k) => (k ?? '').split(','))
      .map((k) => k.trim())
      .filter(Boolean);

    const keywords = SeoAnalyzer.normalizeKeywords(keywordOrKeywords);
    if (keywords.length > 0) {
      // 4. Keyword Count
      addCheck(
        'keywords-count',
        '關鍵字數量',
        keywords.length >= 1 && keywords.length <= 10,
        `已設定 ${keywords.length} 個關鍵字`,
        `目前設定 ${keywords.length} 個關鍵字，建議 1-10 個以利聚焦`,
        1,
        true
      );

      // 4.1 Duplicate keywords (warning)
      addCheck(
        'keywords-duplicates',
        '關鍵字重複',
        rawKeywords.length === keywords.length,
        '關鍵字無重複',
        '關鍵字有重複，建議移除重複項目以聚焦主題',
        1,
        true
      );

      // 5. Keyword Length Mix (short/long-tail)
      const shortKeywords = keywords.filter((k) => k.length <= 4);
      const longKeywords = keywords.filter((k) => k.length >= 5);
      addCheck(
        'keywords-length-mix',
        '關鍵字長短配置',
        shortKeywords.length > 0 && longKeywords.length > 0,
        `已包含短尾 ${shortKeywords.length}、長尾 ${longKeywords.length}`,
        '建議同時包含短尾（較短）與長尾（較長）關鍵字，以兼顧流量與精準度',
        1,
        true
      );

      // 6. Keyword in Title (any)
      addCheck(
        'keyword-title',
        '標題包含關鍵字',
        keywords.some((k) => title.includes(k)),
        '標題包含至少一個關鍵字',
        '建議標題中包含至少一個主要/長尾關鍵字',
        3
      );

      // 7. Keyword in Description (any)
      addCheck(
        'keyword-desc',
        '摘要包含關鍵字',
        keywords.some((k) => description.includes(k)),
        '摘要包含至少一個關鍵字',
        '建議摘要中包含至少一個主要/長尾關鍵字',
        2
      );

      // 8. Keyword in Content (any)
      addCheck(
        'keyword-content',
        '內容包含關鍵字',
        keywords.some((k) => plainTextContent.includes(k)),
        '內容包含至少一個關鍵字',
        '建議文章內容中包含你設定的關鍵字（短尾/長尾皆可）',
        3
      );
    } else {
      checks.push({
        id: 'keywords-missing',
        label: '分析用關鍵字',
        status: 'warning',
        message: '未設定分析用關鍵字（可長可短），無法進行關鍵字相關評分'
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
