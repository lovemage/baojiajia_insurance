-- Adult PDF 模板 SQL 更新腳本
-- 在 Supabase SQL Editor 執行此腳本以更新模板

UPDATE pdf_templates
SET 
  name = 'Adult 保障需求分析報告',
  description = '成人版 16 頁 PDF 報告模板，使用 SVG 背景與變數覆蓋',
  styles = '/* Adult PDF 模板樣式 */
* { box-sizing: border-box; margin: 0; padding: 0; }
.pdf-page {
  width: 794px;
  height: 1123px;
  position: relative;
  page-break-after: always;
  background: white;
  overflow: hidden;
}
.pdf-page:last-child { page-break-after: avoid; }
.svg-bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1;
}
.svg-bg img { width: 100%; height: 100%; object-fit: contain; }
.overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 2;
  pointer-events: none;
}
.field {
  position: absolute;
  font-family: "Microsoft JhengHei", "PingFang TC", sans-serif;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  background: rgba(255,255,255,0.9);
  padding: 2px 8px;
  border-radius: 4px;
}
/* 第1頁 - 封面 */
.page-1 .name-field { top: 420px; left: 280px; font-size: 24px; font-weight: 700; }
.page-1 .date-field { top: 520px; left: 300px; font-size: 16px; }
/* 第2頁 - 基本資料 */
.page-2 .f-name { top: 250px; left: 180px; }
.page-2 .f-phone { top: 290px; left: 180px; }
.page-2 .f-line { top: 330px; left: 180px; }
.page-2 .f-city { top: 370px; left: 180px; }
/* 第3頁 - 醫療保障 */
.page-3 .f-roomType { top: 320px; left: 350px; }
.page-3 .f-roomCost { top: 360px; left: 350px; }
.page-3 .f-hospitalDaily { top: 400px; left: 350px; }
.page-3 .f-surgeryRange { top: 440px; left: 350px; }
.page-3 .f-outpatient { top: 480px; left: 350px; }
/* 第4頁 - 重症保障 */
.page-4 .f-salaryLoss { top: 300px; left: 350px; }
.page-4 .f-livingExpense { top: 360px; left: 350px; }
.page-4 .f-treatmentCost { top: 420px; left: 350px; }
.page-4 .f-oneTime { top: 480px; left: 350px; }
/* 第5頁 - 長照保障 */
.page-5 .f-longTermCare { top: 350px; left: 350px; font-size: 18px; }
/* 第6頁 - 壽險保障 */
.page-6 .f-personalDebt { top: 300px; left: 350px; }
.page-6 .f-familyCare { top: 360px; left: 350px; }
.page-6 .f-disability { top: 420px; left: 350px; }
/* 第7頁 - 意外保障 */
.page-7 .f-accidentDaily { top: 300px; left: 350px; }
.page-7 .f-accidentReimburse { top: 360px; left: 350px; }
.page-7 .f-majorBurn { top: 420px; left: 350px; }
.page-7 .f-homeCare { top: 480px; left: 350px; }',
  html_content = '<!-- 第1頁 - 封面 -->
<div class="pdf-page page-1">
  <div class="svg-bg"><img src="/pdf-templates/adult/1.svg" alt="封面" /></div>
  <div class="overlay">
    <span class="field name-field">{{name}}</span>
    <span class="field date-field">{{generatedDate}}</span>
  </div>
</div>
<!-- 第2頁 - 基本資料 -->
<div class="pdf-page page-2">
  <div class="svg-bg"><img src="/pdf-templates/adult/2.svg" alt="基本資料" /></div>
  <div class="overlay">
    <span class="field f-name">{{name}}</span>
    <span class="field f-phone">{{phone}}</span>
    <span class="field f-line">{{lineId}}</span>
    <span class="field f-city">{{city}}</span>
  </div>
</div>
<!-- 第3頁 - 醫療保障 -->
<div class="pdf-page page-3">
  <div class="svg-bg"><img src="/pdf-templates/adult/3.svg" alt="醫療保障" /></div>
  <div class="overlay">
    <span class="field f-roomType">{{roomType}}</span>
    <span class="field f-roomCost">{{roomCost}}</span>
    <span class="field f-hospitalDaily">{{hospitalDaily}}</span>
    <span class="field f-surgeryRange">{{surgeryRange}}</span>
    <span class="field f-outpatient">{{outpatientSurgeryRange}}</span>
  </div>
</div>
<!-- 第4頁 - 重症保障 -->
<div class="pdf-page page-4">
  <div class="svg-bg"><img src="/pdf-templates/adult/4.svg" alt="重症保障" /></div>
  <div class="overlay">
    <span class="field f-salaryLoss">{{salaryLossInTenThousand}} 萬/月</span>
    <span class="field f-livingExpense">{{livingExpenseInTenThousand}} 萬/年</span>
    <span class="field f-treatmentCost">{{treatmentCostInTenThousand}} 萬</span>
    <span class="field f-oneTime">{{fixedOneTimeBenefit}} 萬</span>
  </div>
</div>
<!-- 第5頁 - 長照保障 -->
<div class="pdf-page page-5">
  <div class="svg-bg"><img src="/pdf-templates/adult/5.svg" alt="長照保障" /></div>
  <div class="overlay">
    <span class="field f-longTermCare">{{longTermCareInTenThousand}} 萬/月</span>
  </div>
</div>
<!-- 第6頁 - 壽險保障 -->
<div class="pdf-page page-6">
  <div class="svg-bg"><img src="/pdf-templates/adult/6.svg" alt="壽險保障" /></div>
  <div class="overlay">
    <span class="field f-personalDebt">{{personalDebt}}</span>
    <span class="field f-familyCare">{{familyCare}}</span>
    <span class="field f-disability">{{disabilityOneTimeRange}}</span>
  </div>
</div>
<!-- 第7頁 - 意外保障 -->
<div class="pdf-page page-7">
  <div class="svg-bg"><img src="/pdf-templates/adult/7.svg" alt="意外保障" /></div>
  <div class="overlay">
    <span class="field f-accidentDaily">{{accidentDailyRange}}</span>
    <span class="field f-accidentReimburse">{{accidentReimbursementRange}}</span>
    <span class="field f-majorBurn">{{majorBurnRange}}</span>
    <span class="field f-homeCare">{{homeCareInTenThousand}} 萬</span>
  </div>
</div>
<!-- 第8-16頁 - 說明頁面 -->
<div class="pdf-page page-8"><div class="svg-bg"><img src="/pdf-templates/adult/8.svg" alt="page8" /></div></div>
<div class="pdf-page page-9"><div class="svg-bg"><img src="/pdf-templates/adult/9.svg" alt="page9" /></div></div>
<div class="pdf-page page-10"><div class="svg-bg"><img src="/pdf-templates/adult/10.svg" alt="page10" /></div></div>
<div class="pdf-page page-11"><div class="svg-bg"><img src="/pdf-templates/adult/11.svg" alt="page11" /></div></div>
<div class="pdf-page page-12"><div class="svg-bg"><img src="/pdf-templates/adult/12.svg" alt="page12" /></div></div>
<div class="pdf-page page-13"><div class="svg-bg"><img src="/pdf-templates/adult/13.svg" alt="page13" /></div></div>
<div class="pdf-page page-14"><div class="svg-bg"><img src="/pdf-templates/adult/14.svg" alt="page14" /></div></div>
<div class="pdf-page page-15"><div class="svg-bg"><img src="/pdf-templates/adult/15.svg" alt="page15" /></div></div>
<div class="pdf-page page-16"><div class="svg-bg"><img src="/pdf-templates/adult/16.svg" alt="page16" /></div></div>'
WHERE is_active = true;

