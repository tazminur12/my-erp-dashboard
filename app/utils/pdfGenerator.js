import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ==================== Bangla Labels ====================
const L_BN = {
  date: "তারিখ",
  customerId: "গ্রাহক আইডি",
  name: "নাম",
  contactNo: "যোগাযোগ নং",
  address: "ঠিকানা",
  paymentMethod: "পেমেন্টের মাধ্যম",
  bank: "ব্যাংক",
  receivingAcc: "গ্রহণকারী ব্যাংক হিসাব নং",
  accountManager: "একাউন্ট ম্যানেজার",
  purpose: "লেনদেনের পরিমাণ",
  clientCopy: "গ্রাহক কপি",
  officeCopy: "অফিস কপি",
  authorizedSignatory: "অনুমোদিত স্বাক্ষরকারী",
  customerSignatory: "গ্রাহকের স্বাক্ষর",
  forVerify: "যাচাই করুন",
  debitAccount: "ডেবিট একাউন্ট",
  creditAccount: "ক্রেডিট একাউন্ট",
};

// ==================== English Labels ====================
const L_EN = {
  date: "Date",
  customerId: "Customer ID",
  name: "Name",
  contactNo: "Contact No",
  address: "Address",
  paymentMethod: "Payment Method",
  bank: "Bank",
  receivingAcc: "Receiving Bank Acc",
  accountManager: "Account Manager",
  purpose: "Purpose",
  clientCopy: "Client Copy",
  officeCopy: "Office Copy",
  authorizedSignatory: "Authorised Signatory",
  customerSignatory: "Customer's Signatory",
  forVerify: "For Verify",
  debitAccount: "Debit Account",
  creditAccount: "Credit Account",
};

let L = L_BN;
const setLanguage = (lang) => {
  L = lang === 'en' ? L_EN : L_BN;
};

// Amount to Words (English)
const amountToWords = (num) => {
  if (!num || num === 0) return L === L_EN ? 'Zero Taka Only' : 'শূন্য টাকা মাত্র';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const convert = (n) => {
    if (n < 1000) return convertLessThanThousand(n);
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    return convertLessThanThousand(thousands) + ' Thousand' + (remainder > 0 ? ' ' + convertLessThanThousand(remainder) : '');
  };

  return convert(Math.floor(num)) + ' Taka Only';
};

// ==================== A4 Single Page Receipt (Fixed Layout) ====================
const createSinglePageReceipt = (data, showHeader = true) => {
  setLanguage(data.language || 'bn');
  
  const isCashPayment = (data.paymentMethod || '').toLowerCase() === 'cash';
  const isBankTransfer = data.isBankTransfer || false;
  
  let displayCustomerId = data.uniqueId || '';
  
  if (!displayCustomerId && data.customerId) {
    const customerIdStr = String(data.customerId);
    if (customerIdStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(customerIdStr)) {
      displayCustomerId = '';
    } else {
      displayCustomerId = customerIdStr;
    }
  }

  const baseAmount = data.amount || 0;
  const charge = parseFloat(data.charge || 0);
  const hasCharge = charge !== 0 && !isNaN(charge);
  const totalAmount = baseAmount + charge;

  // Get category name for display
  let displayCategory = '';
  if (data.category) {
    if (typeof data.category === 'object') {
      displayCategory = data.category.name || data.category.label || data.category.title || '';
    } else if (typeof data.category === 'string') {
      // Check if it's an ObjectId (24 hex characters)
      if (data.category.length === 24 && /^[0-9a-fA-F]{24}$/i.test(data.category)) {
        displayCategory = ''; // It's an ID, not a name
      } else {
        displayCategory = data.category;
      }
    }
  }

  const verificationUrl = `https://bin-rashid-erp.vercel.app/verify/transaction/${data.transactionId || 'N/A'}`;
  const qrData = encodeURIComponent(verificationUrl);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;

  const amountText = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(totalAmount);
  const amountInWords = amountToWords(Math.abs(totalAmount));

  const container = document.createElement('div');

  container.style.cssText = `
    width: 794px;
    height: 1123px;
    margin: 0 auto;
    padding: 20px 40px;
    background: white;
    color: black;
    font-family: 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  `;

  const customerHeaderHTML = `
    <div style="text-align: center; margin-bottom: 10px; padding-bottom: 8px; min-height: ${showHeader ? 'auto' : '80px'};">
      ${showHeader ? `<img src="/invoice/Invoice Header.jpg" alt="Header" style="width: 100%; max-width: 100%; height: auto;" crossorigin="anonymous" />` : ''}
    </div>
  `;

  const officeHeaderHTML = `
    <div style="text-align: center; margin-bottom: 10px; padding-bottom: 8px; min-height: ${showHeader ? 'auto' : '80px'};">
      ${showHeader ? `<img src="/invoice/Invoice Header.jpg" alt="Header" style="width: 100%; max-width: 100%; height: auto;" crossorigin="anonymous" />` : ''}
    </div>
  `;

  const customerFooterHTML = `
    <div style="text-align: center; padding-top: 10px; margin-top: 10px; min-height: ${showHeader ? 'auto' : '80px'};">
      ${showHeader ? `<img src="/invoice/Invoice Footer.jpg" alt="Footer" style="width: 100%; max-width: 100%; height: auto;" crossorigin="anonymous" />` : ''}
    </div>
  `;

  const officeFooterHTML = `
    <div style="text-align: center; padding-top: 10px; margin-top: 10px; min-height: ${showHeader ? 'auto' : '80px'};">
      ${showHeader ? `<img src="/invoice/Invoice Footer.jpg" alt="Footer" style="width: 100%; max-width: 100%; height: auto;" crossorigin="anonymous" />` : ''}
    </div>
  `;

  const createCopyHTML = (isClient) => `
  <div style="position: relative; padding: 10px 0;">
    <!-- Copy Label Box - Perfectly Centered -->
    <div style="width: 100%; text-align: center; margin: 0 auto 8px; padding: 0;">
      <table style="margin: 0 auto; border: 2px solid #000000; background-color: #f5f5f5; border-radius: 4px; border-collapse: separate; border-spacing: 0;">
        <tr>
          <td style="
            padding: 0 18px;
            font-family: 'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            color: #000000;
            text-align: center;
            vertical-align: middle;
            white-space: nowrap;
            line-height: 32px;
            height: 32px;
            width: auto;
            display: table-cell;
          ">
            ${isClient ? L.clientCopy : L.officeCopy}
          </td>
        </tr>
      </table>
    </div>

      <!-- Purpose Box -->
      <div style="position: absolute; top: 10px; right: 0; width: 170px; border: 2px solid black; text-align: center; background: white; border-radius: 4px;">
        <div style="padding: 4px 8px; background: #f8f8f8; border-bottom: 2px solid black; font-weight: bold; font-size: 11px;">
          ${displayCategory && displayCategory !== 'N/A' ? displayCategory : L.purpose}
        </div>
        <div style="padding: 8px 8px 4px;">
          <div style="font-size: 17px; font-weight: bold; color: #d00; margin-bottom: 4px;">৳ ${amountText.replace('BDT', '').trim()}</div>
          <div style="font-size: 9px; line-height: 1.3; color: #333;">
            ${amountInWords}
          </div>
        </div>
      </div>

      <!-- Details Table -->
      <div style="margin-right: 190px; margin-top: 5px; font-size: 14px;">
        <table style="width: 100%; line-height: 1.4; border-collapse: collapse;">
          <tbody>
            ${isBankTransfer ? `
            <tr><td style="padding: 2px 0; width: 35%; font-weight: bold; color: #444;">${L.date}:</td><td>${data.date || 'DD-MM-YYYY'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.paymentMethod}:</td><td>${data.paymentMethod || 'Bank Transfer'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.debitAccount}:</td><td>${data.debitAccountName || '[Debit Account]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.creditAccount}:</td><td>${data.creditAccountName || '[Credit Account]'}</td></tr>
            ${(data.accountManagerName && String(data.accountManagerName).trim()) ? `<tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.accountManager}:</td><td>${String(data.accountManagerName).trim()}</td></tr>` : ''}
            ` : `
            <tr><td style="padding: 2px 0; width: 35%; font-weight: bold; color: #444;">${L.date}:</td><td>${data.date || 'DD-MM-YYYY'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.customerId}:</td><td>${displayCustomerId || ''}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.name}:</td><td>${data.customerName || '[Customer Name]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.contactNo}:</td><td>${data.customerPhone || '[Mobile No]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.address}:</td><td>${(data.customerAddress && data.customerAddress.trim() && data.customerAddress !== '[Full Address]') ? data.customerAddress : '[Full Address]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.paymentMethod}:</td><td>${data.paymentMethod || '[Cash/Etc]'}</td></tr>
            ${!isCashPayment ? `
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.bank}:</td><td>${data.bankName || '[Bank Name]'}</td></tr>
            <tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.receivingAcc}:</td><td>${data.accountNumber || '[Acc No]'}</td></tr>
            ` : ''}
            ${(data.accountManagerName && String(data.accountManagerName).trim()) ? `<tr><td style="padding: 2px 0; font-weight: bold; color: #444;">${L.accountManager}:</td><td>${String(data.accountManagerName).trim()}</td></tr>` : ''}
            `}
          </tbody>
        </table>
      </div>

      <!-- Signatures + QR -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: ${isClient ? '15px' : '25px'};">
        <div style="text-align: center;">
          <div style="width: 180px; height: 2px; background: black; margin-bottom: 4px; margin: 0 auto;"></div>
          <p style="margin: 0; font-size: 12px; font-weight: bold;">
            ${isClient ? L.authorizedSignatory : L.customerSignatory}
          </p>
        </div>
        <div style="text-align: center;">
          <img src="${qrSrc}" alt="QR" style="width: 75px; height: 75px;" />
          <p style="margin: 3px 0 0; font-size: 10px;">${L.forVerify}</p>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = `
    <style>
      @font-face {
        font-family: 'Kalpurush';
        font-display: swap;
        font-style: normal;
        font-weight: 100 900;
        src: url('/fonts/Kalpurush.woff2') format('woff2'),
             url('/fonts/Kalpurush.ttf') format('truetype');
      }
    </style>
    
    ${customerHeaderHTML}
    ${createCopyHTML(true)}
    ${customerFooterHTML}
    
    <div style="height: 20px;"></div>
    
    ${officeHeaderHTML}
    ${createCopyHTML(false)}
    ${officeFooterHTML}
  `;

  return container;
};

// ==================== PDF Generator ====================
export const generateSalmaReceiptPDF = async (transactionData, options = {}) => {
  const { language = 'bn', download = true, filename, showPreview = false, showHeader = true } = options;

  transactionData.language = language;

  try {
    const element = createSinglePageReceipt(transactionData, showHeader);

    if (showPreview) {
      element.style.position = 'relative';
      element.style.left = '0';
      element.style.top = '0';
      element.style.margin = '20px auto';
      element.style.transform = 'scale(0.8)';
      element.style.transformOrigin = 'top center';
      element.style.boxShadow = '0 0 20px rgba(0,0,0,0.1)';
      document.body.appendChild(element);
      return { success: true, element, preview: true };
    }

    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    document.body.appendChild(element);

    // Important: Wait for font to load properly (critical for Bangla)
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 1200));

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      logging: false,
      removeContainer: true,
      imageTimeout: 0,
      letterRendering: true,
      pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
      onclone: (clonedDoc) => {
        // Ensure fonts are applied in cloned document
        const clonedElement = clonedDoc.querySelector('div');
        if (clonedElement) {
          clonedElement.style.fontFamily = "'Kalpurush', 'Noto Sans Bengali', Arial, sans-serif";
        }
      }
    });

    document.body.removeChild(element);

    // Use high-quality JPEG for better balance between quality and file size
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const finalFilename = filename || `Salma_Receipt_${transactionData.transactionId || 'TRX'}_${new Date().toISOString().split('T')[0]}.pdf`;

    if (download) {
      pdf.save(finalFilename);
    }

    return { success: true, filename: finalFilename, pdf };
  } catch (error) {
    console.error('PDF Error:', error);
    return { success: false, error: error.message };
  }
};