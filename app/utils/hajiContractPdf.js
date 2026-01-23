import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '০';
  return Number(amount).toLocaleString('bn-BD');
}

function formatMobileBd(val) {
  if (!val || typeof val !== 'string') return 'N/A';
  const digits = val.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('01')) return digits;
  if (digits.length >= 10) return digits.slice(-11);
  return val.trim() || 'N/A';
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = String(s);
  return div.innerHTML;
}

/**
 * Build HTML for Haji Contract PDF
 * @param {Object} haji - Haji data
 * @param {Object} packageData - Package data (optional)
 * @returns {string} HTML string
 */
function buildContractHTML(haji, packageData = {}) {
  const today = new Date();
  const todayFormatted = formatDate(today);
  
  // Agency info (default values - can be customized)
  const agencyName = 'সালমা এয়ার ট্রাভেলস';
  const agencyLicense = '________________________';
  const agencyAddress = '________________________';
  const agencyPhone = '________________________';
  const agencyRepresentative = '________________________';
  
  // Haji info
  const hajiName = haji.name || haji.firstName || '________________________';
  const fatherName = haji.fatherName || '________________________';
  const nidNumber = haji.nidNumber || '________________________';
  const passportNumber = haji.passportNumber || '________________________';
  const hajiAddress = haji.address || '________________________';
  const hajiMobile = formatMobileBd(haji.mobile || haji.phone) || '________________________';
  
  // Package info
  const packageType = packageData.packageType || haji.packageType || '________________________';
  const packageCategory = packageData.packageCategory || haji.packageCategory || '________________________';
  const packageDuration = packageData.duration || haji.packageDuration || '________________________';
  const hajjSeasonHijri = haji.hajjSeasonHijri || '________________________';
  const hajjSeasonEnglish = haji.hajjSeasonEnglish || '________________________';
  
  // Financial info
  const totalAmount = haji.totalAmount || 0;
  const paymentMethod = haji.paymentMethod || 'নগদ / ব্যাংক / কিস্তি';
  const paymentDates = haji.paymentDates || '________________________________________';
  
  return `
    <div class="contract-container" style="
      width: 794px;
      min-height: 1123px;
      background: #fff;
      padding: 40px 50px;
      box-sizing: border-box;
      font-family: 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif;
      color: #000;
      line-height: 1.8;
    ">
      <style>
        @import url('https://fonts.maateen.me/kalpurush/font.css');
      </style>
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 15px;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #000;">হজ্ব সেবা চুক্তিপত্র</h1>
        <p style="font-size: 16px; margin: 0; color: #333;">
          এই চুক্তিপত্র আজ <strong>${escapeHtml(todayFormatted)}</strong> তারিখে নিম্নস্বাক্ষরকারীদের মধ্যে সম্পাদিত হলো।
        </p>
      </div>

      <!-- Section 1: Agency Info -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">১. এজেন্সির তথ্য</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="width: 35%; padding: 8px 0; font-weight: bold;">এজেন্সির নাম</td>
            <td style="width: 5%; padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(agencyName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">লাইসেন্স নম্বর</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(agencyLicense)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">ঠিকানা</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(agencyAddress)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">ফোন নম্বর</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(agencyPhone)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">প্রতিনিধির নাম ও পদবি</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(agencyRepresentative)}</td>
          </tr>
        </table>
      </div>

      <!-- Section 2: Haji Info -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">২. হাজ্বীর তথ্য</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="width: 35%; padding: 8px 0; font-weight: bold;">পূর্ণ নাম</td>
            <td style="width: 5%; padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(hajiName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">পিতার নাম</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(fatherName)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">জাতীয় পরিচয়পত্র নং</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(nidNumber)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">পাসপোর্ট নং</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(passportNumber)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">ঠিকানা</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(hajiAddress)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">মোবাইল নম্বর</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(hajiMobile)}</td>
          </tr>
        </table>
      </div>

      <!-- Section 3: Package Details -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">৩. হজ প্যাকেজের বিবরণ</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="width: 35%; padding: 8px 0; font-weight: bold;">হজের ধরন</td>
            <td style="width: 5%; padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">সরকারি / বেসরকারি (যেটি প্রযোজ্য)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">প্যাকেজ ক্যাটাগরি</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(packageCategory)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">মেয়াদ (দিন)</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(packageDuration)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">হজ মৌসুম</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">হিজরি ${escapeHtml(hajjSeasonHijri)} / ইংরেজি ${escapeHtml(hajjSeasonEnglish)}</td>
          </tr>
        </table>
      </div>

      <!-- Section 4: Cost & Payment -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">৪. মোট খরচ ও পরিশোধের নিয়ম</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="width: 35%; padding: 8px 0; font-weight: bold;">মোট প্যাকেজ মূল্য</td>
            <td style="width: 5%; padding: 8px 0;">:</td>
            <td style="padding: 8px 0;"><strong>${formatCurrency(totalAmount)} টাকা মাত্র</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">পরিশোধ পদ্ধতি</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(paymentMethod)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">পরিশোধের তারিখসমূহ</td>
            <td style="padding: 8px 0;">:</td>
            <td style="padding: 8px 0;">${escapeHtml(paymentDates)}</td>
          </tr>
        </table>
        <div style="margin-top: 15px; padding: 15px; background: #f9f9f9; border-left: 4px solid #333;">
          <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 14px;">এই খরচের মধ্যে অন্তর্ভুক্ত থাকবে—</p>
          <ul style="margin: 0; padding-left: 25px; font-size: 13px; line-height: 2;">
            <li>বিমান টিকিট (যাওয়া–আসা)</li>
            <li>হজ ভিসা প্রসেসিং</li>
            <li>মক্কা ও মদিনা হোটেল</li>
            <li>সৌদি আরবে লোকাল ট্রান্সপোর্ট</li>
            <li>মিনা, আরাফা, মুজদালিফা সেবা</li>
            <li>মুয়াল্লিম ও গ্রুপ সাপোর্ট</li>
          </ul>
        </div>
      </div>

      <!-- Section 5: Agency Responsibilities -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">৫. এজেন্সির দায়িত্ব</h2>
        <p style="font-size: 14px; margin-bottom: 10px;">
          ${escapeHtml(agencyName)} নিম্নোক্ত সেবা প্রদান করবে—
        </p>
        <ul style="margin: 0; padding-left: 25px; font-size: 13px; line-height: 2;">
          <li>হজ ভিসা প্রসেস করা</li>
          <li>বিমান টিকিট ব্যবস্থা করা</li>
          <li>সৌদি আরবে রিসিভ ও ড্রপ সার্ভিস</li>
          <li>নির্ধারিত মানের হোটেল ও পরিবহন প্রদান</li>
          <li>প্রয়োজনীয় হজ প্রশিক্ষণ ও গাইডলাইন প্রদান</li>
        </ul>
      </div>

      <!-- Section 6: Haji Responsibilities -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">৬. হাজ্বীর দায়িত্ব</h2>
        <p style="font-size: 14px; margin-bottom: 10px;">
          হাজ্বী নিম্নোক্ত বিষয়সমূহ মানতে সম্মত থাকবেন—
        </p>
        <ul style="margin: 0; padding-left: 25px; font-size: 13px; line-height: 2;">
          <li>নির্ধারিত সময়মতো সকল টাকা পরিশোধ করা</li>
          <li>পাসপোর্ট ও প্রয়োজনীয় কাগজপত্র যথাসময়ে জমা দেওয়া</li>
          <li>গ্রুপের নিয়ম ও সৌদি আরবের আইন মেনে চলা</li>
          <li>শৃঙ্খলা বজায় রাখা ও নির্দেশনা অনুসরণ করা</li>
        </ul>
      </div>

      <!-- Section 7: Cancellation & Refund -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">৭. বাতিল ও রিফান্ড নীতি</h2>
        <ul style="margin: 0; padding-left: 25px; font-size: 13px; line-height: 2;">
          <li>হাজ্বী নিজে বাতিল করলে এজেন্সির নীতিমালা অনুযায়ী খরচ কর্তন করা হবে।</li>
          <li>ভিসা ও টিকিট ইস্যু হওয়ার পর বাতিল করলে সংশ্লিষ্ট চার্জ কাটা যাবে।</li>
          <li>সৌদি সরকার বা বাংলাদেশ সরকারের সিদ্ধান্তে হজ বাতিল হলে রিফান্ড সরকার ও এয়ারলাইনের নীতিমালা অনুযায়ী প্রযোজ্য হবে।</li>
        </ul>
      </div>

      <!-- Section 8: Liability -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">৮. দায় ও সীমাবদ্ধতা</h2>
        <ul style="margin: 0; padding-left: 25px; font-size: 13px; line-height: 2;">
          <li>ফ্লাইট বিলম্ব, হোটেল পরিবর্তন বা সৌদি সরকারের নির্দেশে পরিবর্তনের জন্য এজেন্সি সীমিত দায় বহন করবে।</li>
          <li>দুর্ঘটনা, অসুস্থতা বা প্রাকৃতিক দুর্যোগের জন্য এজেন্সি সরাসরি দায়ী থাকবে না।</li>
        </ul>
      </div>

      <!-- Section 9: Contract Duration -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">৯. চুক্তির মেয়াদ</h2>
        <p style="font-size: 14px; margin: 0;">
          এই চুক্তি স্বাক্ষরের তারিখ হতে হজ কার্যক্রম সম্পন্ন হওয়া পর্যন্ত কার্যকর থাকবে।
        </p>
      </div>

      <!-- Section 10: Signatures -->
      <div style="margin-top: 40px;">
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #000; border-bottom: 2px solid #333; padding-bottom: 5px;">১০. স্বাক্ষর</h2>
        <div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <div style="width: 45%;">
            <p style="font-size: 14px; margin-bottom: 40px;">
              <strong>হাজ্বীর স্বাক্ষর</strong> : _______________________<br>
              তারিখ : ${escapeHtml(todayFormatted)}
            </p>
            <p style="font-size: 14px; margin: 0;">
              <strong>নাম</strong> : ${escapeHtml(hajiName)}
            </p>
          </div>
          <div style="width: 45%;">
            <p style="font-size: 14px; margin-bottom: 40px;">
              <strong>এজেন্সি প্রতিনিধি</strong> : _______________________<br>
              তারিখ : ${escapeHtml(todayFormatted)}
            </p>
            <p style="font-size: 14px; margin-bottom: 10px;">
              <strong>নাম ও পদবি</strong> : ${escapeHtml(agencyRepresentative)}
            </p>
            <p style="font-size: 14px; margin: 0;">
              <strong>অফিস সিল</strong> :
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Note -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666; text-align: center;">
        <p style="margin: 0;">
          (সংযুক্তি: প্যাকেজ ডিটেইল শিট / খরচের ব্রেকডাউন / হোটেল তালিকা / সম্ভাব্য ফ্লাইট সূচি)
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate Haji Contract PDF
 * @param {Object} haji - Haji data
 * @param {Object} packageData - Package data (optional)
 * @param {Object} opts - { download?: boolean }
 * @returns {Promise<{ success: boolean, filename?: string, error?: string }>}
 */
export async function generateHajiContractPDF(haji, packageData = {}, opts = {}) {
  const { download = true } = opts;

  const contractHtml = buildContractHTML(haji, packageData);
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 794px;
    background: #fff;
    padding: 0;
    box-sizing: border-box;
  `;
  container.innerHTML = `
    <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
    ${contractHtml}
  `;
  document.body.appendChild(container);

  try {
    // Wait for fonts to load
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 1500));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      imageTimeout: 20000,
      letterRendering: true,
      pixelRatio: Math.min(window.devicePixelRatio || 2, 2),
      width: 794,
      height: container.scrollHeight,
      windowWidth: 794,
      windowHeight: container.scrollHeight,
      onclone: (doc, el) => {
        // Ensure fonts are applied
        const contractDiv = el.querySelector('.contract-container');
        if (contractDiv) {
          contractDiv.style.fontFamily = "'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif";
        }
      },
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const imgW = canvas.width;
    const imgH = canvas.height;
    const margin = 10;
    const maxW = pw - 2 * margin;
    const maxH = ph - 2 * margin;
    
    // Calculate pages needed
    const totalHeight = (imgH * maxW) / imgW;
    const pagesNeeded = Math.ceil(totalHeight / maxH);
    
    let yPos = margin;
    let remainingHeight = imgH;
    let sourceY = 0;

    for (let i = 0; i < pagesNeeded; i++) {
      if (i > 0) {
        pdf.addPage();
        yPos = margin;
      }

      const pageHeight = Math.min(remainingHeight, (maxH * imgW) / maxW);
      const displayHeight = (pageHeight * maxW) / imgW;

      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgW;
      pageCanvas.height = pageHeight;
      const ctx = pageCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, sourceY, imgW, pageHeight, 0, 0, imgW, pageHeight);

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageImgData, 'JPEG', margin, yPos, maxW, displayHeight, undefined, 'NONE');

      sourceY += pageHeight;
      remainingHeight -= pageHeight;
    }

    const safeName = (haji.name || 'haji').replace(/[^a-zA-Z0-9\u0980-\u09FF\s-]/g, '_').trim().slice(0, 40);
    const filename = `হজ্ব_চুক্তিপত্র_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;

    if (download) {
      pdf.save(filename);
    }

    return { success: true, filename, pdf };
  } catch (err) {
    if (container.parentNode) document.body.removeChild(container);
    console.error('Haji contract PDF error:', err);
    return { success: false, error: err?.message || 'PDF generation failed' };
  }
}
