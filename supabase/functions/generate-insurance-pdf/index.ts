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
      console.error('錯誤堆疊:', fetchError.stack);
      throw new Error(`無法連線到模板伺服器: ${fetchError.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [步驟 4/10 失敗] HTTP 錯誤');
      console.error('狀態碼:', response.status);
      console.error('回應內容:', errorText);
      throw new Error(`下載模板失敗: HTTP ${response.status} - ${errorText}`);
    }

    let arrayBuffer;
    try {
      console.log('📦 [步驟 5/10] 讀取檔案內容');
      arrayBuffer = await response.arrayBuffer();
      console.log('✅ [步驟 5/10] 檔案讀取成功');
      console.log('📊 檔案大小:', arrayBuffer.byteLength, 'bytes');
    } catch (bufferError) {
      console.error('❌ [步驟 5/10 失敗] 讀取檔案失敗');
      console.error('錯誤訊息:', bufferError.message);
      throw new Error(`讀取檔案內容失敗: ${bufferError.message}`);
    }

    // 驗證是否為 PDF
    console.log('🔍 [步驟 6/10] 驗證 PDF 格式');
    const header = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode(...header);
    console.log('📋 檔案標頭:', headerStr);
    
    if (!headerStr.startsWith('%PDF')) {
      console.error('❌ [步驟 6/10 失敗] 不是 PDF 檔案');
      console.error('檔案標頭:', headerStr);
      console.error('前 100 bytes:', new TextDecoder().decode(arrayBuffer.slice(0, 100)));
      throw new Error(`下載的檔案不是 PDF 格式 (標頭: ${headerStr})`);
    }
    console.log('✅ [步驟 6/10] PDF 格式驗證通過');

    // 載入 PDF
    console.log('📖 [步驟 7/10] 載入 PDF 文件');
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer);
      console.log('✅ [步驟 7/10] PDF 載入成功');
      
      // 註冊 fontkit（必須在嵌入自訂字體前完成）
      console.log('🔧 註冊 fontkit...');
      pdfDoc.registerFontkit(fontkit);
      console.log('✅ fontkit 註冊成功');
    } catch (loadError) {
      console.error('❌ [步驟 7/10 失敗] PDF 載入失敗');
      console.error('錯誤類型:', loadError.name);
      console.error('錯誤訊息:', loadError.message);
      console.error('錯誤堆疊:', loadError.stack);
      throw new Error(`PDF 文件損壞或格式不正確: ${loadError.message}`);
    }

    const pages = pdfDoc.getPages();
    console.log('📄 PDF 總頁數:', pages.length);

    if (pages.length === 0) {
      throw new Error('PDF 沒有任何頁面');
    }

    // 下載並嵌入中文字體（思源黑體）
    console.log('🔤 [步驟 8/10] 下載並嵌入中文字體');
    let font;
    try {
      console.log('  📥 正在下載思源黑體...');
      const fontResponse = await fetch('https://cdn.jsdelivr.net/npm/source-han-sans-cn@1.0.0/SourceHanSansCN-Regular.otf');
      
      if (!fontResponse.ok) {
        throw new Error(`下載字體失敗: HTTP ${fontResponse.status}`);
      }
      
      const fontBytes = await fontResponse.arrayBuffer();
      console.log('  ✓ 字體下載完成，大小:', fontBytes.byteLength, 'bytes');
      
      console.log('  🔧 正在嵌入字體到 PDF...');
      font = await pdfDoc.embedFont(fontBytes);
      console.log('✅ [步驟 8/10] 中文字體嵌入完成');
    } catch (fontError) {
      console.error('❌ [步驟 8/10 失敗] 字體處理失敗');
      console.error('錯誤訊息:', fontError.message);
      console.error('錯誤堆疊:', fontError.stack);
      throw new Error(`字體處理失敗: ${fontError.message}`);
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
        console.log('  ✓ 第1頁 - 姓名:', data.name);
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
        console.log('  ✓ 第3頁 - 病房費用:', roomCost);
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
        console.log('  ✓ 第3頁 - 住院日額:', data.hospitalDaily);
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
        console.log('  ✓ 第3頁 - 手術補貼:', data.surgeryRange);
        console.log('  ✓ 第3頁 - 門診雜費: 5～10萬');
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
        console.log('  ✓ 第6頁 - 薪資損失:', data.salaryLossInTenThousand, '萬');
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
        console.log('  ✓ 第6頁 - 生活開銷:', data.livingExpenseInTenThousand, '萬');
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
        console.log('  ✓ 第6頁 - 治療費用:', data.treatmentCostInTenThousand, '萬');
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
        console.log('  ✓ 第7頁 - 一次性理賠金: 100');
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
        console.log('  ✓ 第8頁 - 長照費用（疾病+意外）:', data.longTermCareInTenThousand, '萬');
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
        console.log('  ✓ 第4頁 - 個人債務:', formatNumber(data.personalDebt));
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
        console.log('  ✓ 第5頁 - 家人照顧金:', formatNumber(data.familyCare));
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
        console.log('  ✓ 第5頁 - 意外住院日額: 1,000～2,000');
        
        // 意外實支實付（固定）
        pages[4].drawText('5～10', {
          x: 450,
          y: 300,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        console.log('  ✓ 第5頁 - 意外實支實付: 5～10');
        
        // 重大燒燙傷（固定）
        pages[4].drawText('50～100', {
          x: 450,
          y: 250,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        console.log('  ✓ 第5頁 - 重大燒燙傷: 50～100');
        
        // 居家休養費用（月收入換算）
        if (data.monthlyIncomeInTenThousand) {
          pages[4].drawText(data.monthlyIncomeInTenThousand.toString(), {
            x: 450,
            y: 200,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
          console.log('  ✓ 第5頁 - 居家休養:', data.monthlyIncomeInTenThousand, '萬');
        }
      }

      console.log('✅ [步驟 9/10] 所有資料填寫完成');
    } catch (drawError) {
      console.error('❌ [步驟 9/10 失敗] 填寫資料時發生錯誤');
      console.error('錯誤類型:', drawError.name);
      console.error('錯誤訊息:', drawError.message);
      console.error('錯誤堆疊:', drawError.stack);
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
      console.error('錯誤類型:', saveError.name);
      console.error('錯誤訊息:', saveError.message);
      console.error('錯誤堆疊:', saveError.stack);
      throw new Error(`儲存 PDF 失敗: ${saveError.message}`);
    }

    console.log('🎉 PDF 生成成功！準備回傳檔案');

    // 對中文檔名進行 URL 編碼，避免 ByteString 錯誤
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
    console.error('');
    console.error('═══════════════════════════════════════');
    console.error('❌❌❌ 發生嚴重錯誤 ❌❌❌');
    console.error('═══════════════════════════════════════');
    console.error('錯誤類型:', error.name);
    console.error('錯誤訊息:', error.message);
    console.error('錯誤堆疊:', error.stack);
    console.error('時間戳記:', new Date().toISOString());
    console.error('═══════════════════════════════════════');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '生成 PDF 時發生未知錯誤',
        errorType: error.name,
        timestamp: new Date().toISOString(),
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});