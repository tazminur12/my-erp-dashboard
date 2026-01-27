import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Official Islami Bank Logo URL (high resolution) - Example fallback
const BANK_LOGO_URL = 'https://ecdn.dhakatribune.net/contents/cache/images/1200x630x1xxxxx1/uploads/media/2025/09/28/Islami-Bank-Bangladesh-PLC-c4d7c1c3b411a194bba8574afa1bbc64.png';

const ITEMS_PER_PAGE = 20; // Reduced slightly to ensure better fit with larger headers

const createBankStatementElement = (statementData, pageNumber = 1) => {
  const {
    bankAccount = {},
    transactions = [],
    totals = {},
    periodStart,
    periodEnd
  } = statementData;

  const currencySymbol = bankAccount.currency === 'USD' ? '$' : '৳';

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    return Number(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '/');
  };

  const getDescription = (transaction) => {
    const isObjectId = (str) => {
      if (!str || typeof str !== 'string') return false;
      return /^[0-9a-fA-F]{24}$/.test(str);
    };

    // Helper to capitalize words
    const capitalize = (str) => str.split(/[-_ ]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    if (transaction.serviceCategory) {
      const category = String(transaction.serviceCategory).toLowerCase();
      if (!isObjectId(category)) {
        return capitalize(category);
      }
    }
    
    if (transaction.meta?.selectedOption) {
      const option = String(transaction.meta.selectedOption).toLowerCase();
      if (!isObjectId(option)) {
        return capitalize(option);
      }
    }
    
    if (transaction.category) {
      if (typeof transaction.category === 'string' && !isObjectId(transaction.category)) {
        return transaction.category;
      } else if (typeof transaction.category === 'object' && transaction.category.name) {
        return transaction.category.name;
      }
    }
    
    if (transaction.notes && transaction.notes.trim() && !isObjectId(transaction.notes.trim())) {
      const notes = transaction.notes.trim();
      return notes.length > 50 ? notes.substring(0, 50) + '...' : notes;
    }
    
    if (transaction.description) {
      const desc = String(transaction.description);
      if (!isObjectId(desc)) {
        return desc;
      }
    }

    if (transaction.isTransfer) {
      const ref = transaction.transferDetails?.reference || transaction.transferDetails?.chequeNo || '';
      return `Transfer ${ref}`.trim();
    }
    
    return 'Transaction';
  };

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, transactions.length);
  const pageTransactions = transactions.slice(startIndex, endIndex);
  
  // Get current date and time for report
  const now = new Date();
  const reportDate = formatDate(now);
  const reportTime = now.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  const container = document.createElement('div');
  // A4 size in pixels at 96 DPI is approx 794x1123
  container.style.cssText = `
    width: 794px;
    min-height: 1123px;
    padding: 40px;
    background: white;
    font-family: 'NotoSansBengali', 'Arial', sans-serif;
    font-size: 10px;
    color: #000;
    box-sizing: border-box;
    position: relative;
    line-height: 1.4;
  `;

  // Inject font face
  const style = document.createElement('style');
  style.innerHTML = `
    @font-face {
      font-family: 'NotoSansBengali';
      src: url('/fonts/NotoSansBengali-Regular.ttf') format('truetype');
    }
  `;
  container.appendChild(style);

  container.innerHTML += `
    <!-- Header - Only on first page -->
    ${pageNumber === 1 ? `
    <div style="text-align: center; margin-bottom: 25px;">
      ${bankAccount.logo ? `
      <img src="${bankAccount.logo}" 
           style="height: 60px; margin-bottom: 10px; object-fit: contain;" 
           alt="Bank Logo" 
           onerror="this.style.display='none'" />
      ` : ''}
      <h1 style="margin: 0; font-size: 22px; font-weight: bold; color: #1E3A8A; letter-spacing: 0.5px; text-transform: uppercase;">
        ${bankAccount.bankName || 'BANK STATEMENT'}
      </h1>
      <p style="margin: 5px 0 0; font-size: 11px; color: #555;">
        ${bankAccount.branchName ? `${bankAccount.branchName} Branch` : ''} 
        ${bankAccount.branchAddress ? `| ${bankAccount.branchAddress}` : ''}
      </p>
      
      <div style="margin-top: 20px; border-bottom: 2px solid #1E3A8A; width: 100%;"></div>
    </div>

    <!-- Account Summary Section -->
    <div style="margin-bottom: 25px; display: flex; justify-content: space-between; gap: 20px;">
      <div style="flex: 1; background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #1E3A8A;">
        <h3 style="margin: 0 0 10px; font-size: 12px; font-weight: bold; color: #1E3A8A; border-bottom: 1px solid #ddd; padding-bottom: 5px;">ACCOUNT DETAILS</h3>
        <table style="width: 100%; font-size: 10px;">
          <tr><td style="color: #666; padding: 2px 0; width: 90px;">Account Name:</td><td style="font-weight: bold;">${bankAccount.accountHolder || bankAccount.accountTitle || 'N/A'}</td></tr>
          <tr><td style="color: #666; padding: 2px 0;">Account No:</td><td style="font-weight: bold;">${bankAccount.accountNumber || 'N/A'}</td></tr>
          <tr><td style="color: #666; padding: 2px 0;">Account Type:</td><td>${bankAccount.accountType || 'N/A'}</td></tr>
          <tr><td style="color: #666; padding: 2px 0;">Currency:</td><td>${bankAccount.currency || 'BDT'}</td></tr>
        </table>
      </div>

      <div style="flex: 1; background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #059669;">
        <h3 style="margin: 0 0 10px; font-size: 12px; font-weight: bold; color: #059669; border-bottom: 1px solid #ddd; padding-bottom: 5px;">STATEMENT SUMMARY</h3>
        <table style="width: 100%; font-size: 10px;">
          <tr><td style="color: #666; padding: 2px 0;">Period:</td><td style="text-align: right;">${formatDate(periodStart)} to ${formatDate(periodEnd)}</td></tr>
          <tr><td style="color: #666; padding: 2px 0;">Opening Balance:</td><td style="text-align: right; font-weight: bold;">${formatCurrency(totals.openingBalance)}</td></tr>
          <tr><td style="color: #666; padding: 2px 0;">Total Credits:</td><td style="text-align: right; color: #059669;">+${formatCurrency(totals.deposits)}</td></tr>
          <tr><td style="color: #666; padding: 2px 0;">Total Debits:</td><td style="text-align: right; color: #DC2626;">-${formatCurrency(totals.withdrawals)}</td></tr>
          <tr><td style="border-top: 1px solid #ddd; padding-top: 4px; font-weight: bold;">Closing Balance:</td><td style="border-top: 1px solid #ddd; padding-top: 4px; text-align: right; font-weight: bold; color: #1E3A8A;">${formatCurrency(totals.closingBalance)}</td></tr>
        </table>
      </div>
    </div>
    ` : ''}

     <!-- Page Header (for subsequent pages) -->
     ${pageNumber > 1 ? `
     <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc;">
       <div style="display: flex; justify-content: space-between; align-items: flex-end;">
         <div>
           <strong style="color: #1E3A8A; font-size: 12px;">${bankAccount.bankName || 'Bank Statement'}</strong>
           <div style="font-size: 10px; color: #666;">Account: ${bankAccount.accountNumber}</div>
         </div>
         <div style="text-align: right; font-size: 9px; color: #666;">
           Page ${pageNumber} of ${totalPages}<br/>
           Statement Period: ${formatDate(periodStart)} - ${formatDate(periodEnd)}
         </div>
       </div>
    </div>
    ` : ''}

    <!-- Transaction Table -->
    <div style="margin-top: ${pageNumber === 1 ? '10px' : '0'};">
      <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 10px;">
        <thead>
          <tr style="background: #1E3A8A; color: white;">
            <th style="padding: 10px 6px; text-align: left; font-weight: 600; width: 70px;">Date</th>
            <th style="padding: 10px 6px; text-align: left; font-weight: 600; width: 60px;">Type</th>
            <th style="padding: 10px 6px; text-align: left; font-weight: 600;">Description</th>
            <th style="padding: 10px 6px; text-align: right; font-weight: 600; width: 85px;">Deposit (${currencySymbol})</th>
            <th style="padding: 10px 6px; text-align: right; font-weight: 600; width: 85px;">Withdraw (${currencySymbol})</th>
            <th style="padding: 10px 6px; text-align: right; font-weight: 600; width: 60px;">Charge</th>
            <th style="padding: 10px 6px; text-align: right; font-weight: 600; width: 90px;">Balance (${currencySymbol})</th>
          </tr>
        </thead>
        <tbody>
          ${pageTransactions.length > 0 ? pageTransactions.map((t, i) => {
            const isCredit = t.transactionType === 'credit' || (t.isTransfer && t.transferDetails?.direction === 'in');
            const amount = Number(t.amount) || 0;
            const withdraw = !isCredit && !t.isTransfer ? amount : 0;
            const deposit = isCredit || t.isTransfer ? amount : 0;
            const charge = Number(t.charge) || 0;
            // Use provided balanceAfter if available, otherwise it's hard to calculate per row without full history
            // We'll display '-' if not available to avoid confusion, or closing balance on last row if matches
            const balance = t.balanceAfter !== undefined ? t.balanceAfter : null;
            
            return `
              <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8f9fa'}; border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 6px; color: #374151;">${formatDate(t.date || t.createdAt)}</td>
                <td style="padding: 8px 6px;">
                  <span style="font-size: 8px; padding: 2px 4px; border-radius: 3px; font-weight: 500; 
                    background: ${t.isTransfer ? '#F3E8FF' : isCredit ? '#DCFCE7' : '#FEE2E2'}; 
                    color: ${t.isTransfer ? '#6B21A8' : isCredit ? '#166534' : '#991B1B'};">
                    ${t.isTransfer ? 'TRANSFER' : (t.transactionType || 'TXN').toUpperCase()}
                  </span>
                </td>
                <td style="padding: 8px 6px; color: #1f2937; line-height: 1.3;">
                  <div style="font-weight: 500;">${getDescription(t)}</div>
                  ${t.referenceNo || t.transactionId ? `<div style="font-size: 8px; color: #6b7280; margin-top: 2px;">Ref: ${t.referenceNo || t.transactionId}</div>` : ''}
                </td>
                <td style="padding: 8px 6px; text-align: right; color: #059669; font-weight: ${deposit > 0 ? '500' : 'normal'};">
                  ${deposit > 0 ? formatCurrency(deposit) : '-'}
                </td>
                <td style="padding: 8px 6px; text-align: right; color: #DC2626; font-weight: ${withdraw > 0 ? '500' : 'normal'};">
                  ${withdraw > 0 ? formatCurrency(withdraw) : '-'}
                </td>
                <td style="padding: 8px 6px; text-align: right; color: #6b7280;">
                  ${charge > 0 ? formatCurrency(charge) : '-'}
                </td>
                <td style="padding: 8px 6px; text-align: right; font-weight: 600; color: #111827;">
                  ${balance !== null ? formatCurrency(balance) : '-'}
                </td>
              </tr>
            `;
          }).join('') : `
            <tr>
              <td colspan="7" style="padding: 30px; text-align: center; color: #6b7280; font-style: italic; background: #f9fafb;">
                No transactions found for this period.
              </td>
            </tr>
          `}

          <!-- Totals Row (Only on last page) -->
          ${pageNumber === totalPages && pageTransactions.length > 0 ? `
            <tr style="background: #f0f9ff; border-top: 2px solid #1E3A8A; font-weight: bold;">
              <td colspan="3" style="padding: 12px 6px; text-align: right; color: #1E3A8A;">TOTALS:</td>
              <td style="padding: 12px 6px; text-align: right; color: #059669;">${formatCurrency(totals.deposits)}</td>
              <td style="padding: 12px 6px; text-align: right; color: #DC2626;">${formatCurrency(totals.withdrawals)}</td>
              <td style="padding: 12px 6px; text-align: right; color: #DC2626;">${formatCurrency(totals.charges || 0)}</td>
              <td style="padding: 12px 6px; text-align: right; color: #1E3A8A;">${formatCurrency(totals.closingBalance)}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="position: absolute; bottom: 30px; left: 40px; right: 40px; font-size: 8px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px;">
      <div style="display: flex; justify-content: space-between;">
        <div>
          Generated on ${reportDate} at ${reportTime}<br/>
          System Generated Report
        </div>
        <div style="text-align: right;">
          Page ${pageNumber} of ${totalPages}
        </div>
      </div>
    </div>
  `;

  return { container, totalPages };
};

export const generateBankStatementPDF = async (statementData, options = {}) => {
  const { download = true, filename } = options;

  try {
    const totalPages = Math.ceil((statementData.transactions?.length || 0) / ITEMS_PER_PAGE) || 1;
    const pdf = new jsPDF('p', 'pt', 'a4');
    
    for (let page = 1; page <= totalPages; page++) {
      const { container } = createBankStatementElement(statementData, page);
      
      // Add container to DOM temporarily
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      // Convert to canvas with high quality
      const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        imageTimeout: 0,
        removeContainer: true
      });

      // Remove container from DOM
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add new page if not first page
      if (page > 1) pdf.addPage();
      
      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, `page${page}`, 'FAST');
    }

    const finalFilename = filename || `Statement_${statementData.bankAccount?.accountNumber || 'Account'}.pdf`;
    
    if (download) {
      pdf.save(finalFilename);
    }

    return { 
      success: true, 
      filename: finalFilename
    };
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};
