import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { PDFDocument, rgb } from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 [步驟 1/10] 開始處理 PDF 生成請求');
    
    const data = await req.json();
    console.log('✅ [步驟 2/10] 成功接收資料');
    console.log('📥 收到的資料:', JSON.stringify(data, null, 2));

    // 使用 Supabase Storage 的穩定連結
    const templateUrl = 'https://kdqktpprqasgdxihacwc.supabase.co/storage/v1/object/public/pdf-templates/insurance-analysis-template.pdf.pdf';
    
    console.log('📄 [步驟 3/10] 開始下載 PDF 模板');
    console.log('🔗 模板網址:', templateUrl);
    
    let response;
    try {
      response = await fetch(templateUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      console.log('✅ [步驟 4/10] 下載請求完成');
      console.log('📡 HTTP 狀態:', response.status, response.statusText);
      console.log('📋 Content-Type:', response.headers.get('content-type'));
    } catch (fetchError) {
      console.error('❌ [步驟 4/10 失敗] 下載請求失敗');
      console.error('錯誤類型:', fetchError.name);
      console.error('錯誤訊息:', fetchError.message);
      throw new Error(`無法連線到模板伺服器: ${fetchError.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`下載模板失敗: HTTP ${response.status} - ${errorText}`);
    }

    let arrayBuffer;
    try {
      console.log('📦 [步驟 5/10] 讀取檔案內容');
      arrayBuffer = await response.arrayBuffer();
      console.log('✅ [步驟 5/10] 檔案讀取成功');
    } catch (bufferError) {
      console.error('❌ [步驟 5/10 失敗] 讀取檔案失敗');
      throw new Error(`讀取檔案內容失敗: ${bufferError.message}`);
    }

    // 驗證是否為 PDF
    const header = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode(...header);
    
    if (!headerStr.startsWith('%PDF')) {
      throw new Error(`下載的檔案不是 PDF 格式 (標頭: ${headerStr})`);
    }

    // 載入 PDF
    console.log('📖 [步驟 7/10] 載入 PDF 文件');
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer);
      console.log('✅ [步驟 7/10] PDF 載入成功');
      
      console.log('🔧 註冊 fontkit...');
      pdfDoc.registerFontkit(fontkit);
    } catch (loadError) {
      console.error('❌ [步驟 7/10 失敗] PDF 載入失敗');
      throw new Error(`PDF 文件損壞或格式不正確: ${loadError.message}`);
    }

    const pages = pdfDoc.getPages();
    console.log('📄 PDF 總頁數:', pages.length);

    if (pages.length === 0) {
      throw new Error('PDF 沒有任何頁面');
    }

    // 下載並嵌入中文字體（使用 Noto Sans TC TTF）
    console.log('🔤 [步驟 8/10] 下載並嵌入中文字體');
    let font;
    try {
      console.log('  📥 正在下載 Noto Sans TC (Traditional Chinese)...');
      // 使用穩定可靠的字體 CDN 來源 (Google Fonts via CDN)
      // 注意: pdf-lib 需要完整的字體檔，不能是 woff2 格式，最好是 ttf 或 otf
      // 這裡使用 Google Fonts 的原始 ttf 文件連結 (如果可用) 或其他穩定來源
      // 由於 Google Fonts 通常提供 woff2，我們改用一個穩定的開源字體庫連結
      
      const fontUrl = 'https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/TraditionalChinese/SourceHanSansTC-Regular.otf';
      
      console.log('🔗 字體網址:', fontUrl);
      
      const fontResponse = await fetch(fontUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });

      if (!fontResponse.ok) {
        console.log('  ⚠️ GitHub 字體來源失敗，嘗試備用來源 (JustFont)...');
        // 備用: 使用另一個開源字體來源
        const backupFontUrl = 'https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf';
        const backupResponse = await fetch(backupFontUrl);
        
        if (!backupResponse.ok) {
           throw new Error(`下載字體失敗: HTTP ${fontResponse.status} / ${backupResponse.status}`);
        }
        
        const fontBytes = await backupResponse.arrayBuffer();
        console.log('  ✓ 備用字體下載完成，大小:', fontBytes.byteLength, 'bytes');
        font = await pdfDoc.embedFont(fontBytes);
        
      } else {
        const fontBytes = await fontResponse.arrayBuffer();
        console.log('  ✓ 字體下載完成，大小:', fontBytes.byteLength, 'bytes');
        console.log('  🔧 正在嵌入字體到 PDF...');
        font = await pdfDoc.embedFont(fontBytes);
      }
      console.log('✅ [步驟 8/10] 中文字體嵌入完成');
    } catch (fontError) {
      console.error('❌ [步驟 8/10 失敗] 字體處理失敗');
      console.error('錯誤訊息:', fontError.message);
      
      // 最後手段：使用標準英文字體 (至少能顯示數字和英文，避免完全失敗)
      console.warn('⚠️ 無法載入中文字體，降級使用標準英文字體 (中文將無法顯示)');
      font = await pdfDoc.embedFont('Helvetica');
    }

    // 格式化數字為千分位
    const formatNumber = (num: number): string => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    console.log('✍️ [步驟 9/10] 開始填寫資料到 PDF');

    try {
      // 規則 2: 第一頁 - 姓名
      if (data.name && pages[0]) {
        pages[0].drawText(data.name, {
          x: 300,
          y: 650,
          size: 16,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 3: 第三頁 - 病房費用
      if (pages[2]) {
        const roomCost = data.roomCost || 0;
        pages[2].drawText(formatNumber(roomCost), {
          x: 450,
          y: 400,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 4: 第三頁 - 住院日額
      if (data.hospitalDaily && pages[2]) {
        pages[2].drawText(formatNumber(data.hospitalDaily), {
          x: 450,
          y: 350,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 5: 第三頁 - 手術補貼 + 門診雜費
      if (data.surgeryRange && pages[2]) {
        pages[2].drawText(data.surgeryRange, {
          x: 450,
          y: 300,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        // 門診雜費固定 5～10萬
        pages[2].drawText('5～10萬', {
          x: 450,
          y: 250,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 6: 第六頁 - 薪資損失
      if (data.salaryLossInTenThousand && pages[5]) {
        pages[5].drawText(data.salaryLossInTenThousand.toString(), {
          x: 450,
          y: 400,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 7: 第六頁 - 生活開銷
      if (data.livingExpenseInTenThousand && pages[5]) {
        pages[5].drawText(data.livingExpenseInTenThousand.toString(), {
          x: 450,
          y: 350,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 8: 第六頁 - 治療費用
      if (data.treatmentCostInTenThousand && pages[5]) {
        pages[5].drawText(data.treatmentCostInTenThousand.toString(), {
          x: 450,
          y: 300,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 9: 第七頁 - 一次性理賠金（固定 100）
      if (pages[6]) {
        pages[6].drawText('100', {
          x: 450,
          y: 400,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 10: 第八頁 - 長照費用
      if (data.longTermCareInTenThousand && pages[7]) {
        // 疾病
        pages[7].drawText(data.longTermCareInTenThousand.toString(), {
          x: 450,
          y: 400,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        // 意外
        pages[7].drawText(data.longTermCareInTenThousand.toString(), {
          x: 450,
          y: 350,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 11: 第四頁 - 個人債務
      if (data.personalDebt && pages[3]) {
        pages[3].drawText(formatNumber(data.personalDebt), {
          x: 450,
          y: 400,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 12: 第五頁 - 家人照顧金
      if (data.familyCare && pages[4]) {
        pages[4].drawText(formatNumber(data.familyCare), {
          x: 450,
          y: 400,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      // 規則 13: 第五頁 - 意外保障
      if (pages[4]) {
        // 意外住院日額（固定）
        pages[4].drawText('1,000～2,000', {
          x: 450,
          y: 350,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        // 意外實支實付（固定）
        pages[4].drawText('5～10', {
          x: 450,
          y: 300,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        // 重大燒燙傷（固定）
        pages[4].drawText('50～100', {
          x: 450,
          y: 250,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        // 居家休養費用（月收入換算）
        if (data.monthlyIncomeInTenThousand) {
          pages[4].drawText(data.monthlyIncomeInTenThousand.toString(), {
            x: 450,
            y: 200,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
      }

      console.log('✅ [步驟 9/10] 所有資料填寫完成');
    } catch (drawError) {
      console.error('❌ [步驟 9/10 失敗] 填寫資料時發生錯誤');
      throw new Error(`填寫資料失敗: ${drawError.message}`);
    }

    // 儲存 PDF
    console.log('💾 [步驟 10/10] 儲存 PDF');
    let pdfBytes;
    try {
      pdfBytes = await pdfDoc.save();
      console.log('✅ [步驟 10/10] PDF 生成完成');
      console.log('📊 最終檔案大小:', pdfBytes.byteLength, 'bytes');
    } catch (saveError) {
      console.error('❌ [步驟 10/10 失敗] 儲存 PDF 失敗');
      throw new Error(`儲存 PDF 失敗: ${saveError.message}`);
    }

    console.log('🎉 PDF 生成成功！準備回傳檔案');

    // 對中文檔名進行 URL 編碼
    const fileName = `保障需求分析報告_${data.name || 'customer'}.pdf`;
    const encodedFileName = encodeURIComponent(fileName);

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`,
      },
    });

  } catch (error) {
    console.error('❌❌❌ 發生嚴重錯誤 ❌❌❌');
    console.error('錯誤訊息:', error.message);
    console.error('堆疊:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '生成 PDF 時發生未知錯誤',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
