import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Official Islami Bank Logo URL (high resolution)
const BANK_LOGO_URL = 'https://ecdn.dhakatribune.net/contents/cache/images/1200x630x1xxxxx1/uploads/media/2025/09/28/Islami-Bank-Bangladesh-PLC-c4d7c1c3b411a194bba8574afa1bbc64.png';

const ITEMS_PER_PAGE = 25; // প্রতিটি পেজে কতগুলো ট্রানজেকশন দেখাবে

const createBankStatementElement = (statementData, pageNumber = 1) => {
  const {
    bankAccount = {},
    transactions = [],
    totals = {},
    periodStart,
    periodEnd
  } = statementData;

  const formatCurrency = (amount, currency = 'BDT') => {
    if (!amount && amount !== 0) return '0.00';
    return `${Number(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
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
    if (transaction.description) return transaction.description;
    if (transaction.isTransfer) {
      const ref = transaction.transferDetails?.reference || transaction.transferDetails?.chequeNo || '';
      return `Transfer ${ref}`.trim();
    }
    if (transaction.notes) return transaction.notes;
    if (transaction.category) return transaction.category;
    if (transaction.serviceCategory) return transaction.serviceCategory;
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
  container.style.cssText = `
    width: 794px;
    min-height: ${pageNumber === 1 ? '1123px' : '1123px'};
    padding: ${pageNumber === 1 ? '30px 40px 20px' : '20px 40px 20px'};
    background: white;
    font-family: 'Arial', 'Helvetica', sans-serif;
    font-size: 10px;
    color: #000;
    box-sizing: border-box;
    position: relative;
  `;

  container.innerHTML = `
    <!-- Header - Only on first page -->
    ${pageNumber === 1 ? `
    <div style="text-align: center; margin-bottom: 15px;">
      ${bankAccount.logo ? `
      <img src="${bankAccount.logo}" 
           style="height: 70px; margin-bottom: 5px; object-fit: contain;" 
           alt="${bankAccount.bankName || 'Bank'} Logo" 
           onerror="this.style.display='none'" />
      ` : ''}
      <h1 style="margin: 0; font-size: 20px; font-weight: bold; color: #1E3A8A; letter-spacing: 0.5px;">
        ${bankAccount.bankName ? bankAccount.bankName.toUpperCase() : 'BANK'}
      </h1>
      <p style="margin: 3px 0; font-size: 11px; color: #555;">
        ${bankAccount.branchName || 'Head Office'} Branch
      </p>
      <div style="border-top: 3px solid #1E3A8A; width: 100%; margin: 10px 0 8px;"></div>
      <p style="margin: 5px 0; font-size: 12px; font-weight: bold; color: #1E3A8A;">
        ACCOUNT STATEMENT
      </p>
      <p style="margin: 3px 0; font-size: 10px; color: #666;">
        Period: ${formatDate(periodStart)} to ${formatDate(periodEnd)}
      </p>
      <p style="margin: 10px 0 5px; text-align: right; font-size: 9px; color: #777;">
        Generated: ${reportDate} at ${reportTime}
      </p>
    </div>

    <!-- Account Information Section -->
    <div style="margin-bottom: 15px; background: #f8f9fa; padding: 12px; border-radius: 4px; border-left: 4px solid #1E3A8A;">
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
        <tr>
          <td style="width: 35%;">
            <table style="width: 100%;">
              ${bankAccount.accountHolder ? `<tr><td style="font-weight: bold; width: 110px;">Account Holder:</td><td>${bankAccount.accountHolder}</td></tr>` : ''}
              ${bankAccount.accountNumber ? `<tr><td style="font-weight: bold;">Account No:</td><td>${bankAccount.accountNumber}</td></tr>` : ''}
              ${bankAccount.accountType ? `<tr><td style="font-weight: bold;">Account Type:</td><td>${bankAccount.accountType}</td></tr>` : ''}
            </table>
          </td>
          <td style="width: 35%;">
            <table style="width: 100%;">
              ${bankAccount.customerId ? `<tr><td style="font-weight: bold; width: 110px;">Customer ID:</td><td>${bankAccount.customerId}</td></tr>` : ''}
              ${bankAccount.routingNumber ? `<tr><td style="font-weight: bold;">Routing No:</td><td>${bankAccount.routingNumber}</td></tr>` : ''}
              ${bankAccount.createdAt ? `<tr><td style="font-weight: bold;">Opening Date:</td><td>${formatDate(bankAccount.createdAt)}</td></tr>` : ''}
            </table>
          </td>
          <td style="width: 30%; vertical-align: top;">
            <div style="background: white; padding: 8px; border-radius: 3px; border: 1px solid #ddd;">
              <p style="margin: 0; font-size: 9px; font-weight: bold;">Summary</p>
              <p style="margin: 3px 0; font-size: 8.5px;">Opening: ${formatCurrency(totals.openingBalance || 0)}</p>
              <p style="margin: 3px 0; font-size: 8.5px;">Total Deposit: ${formatCurrency(totals.deposits || 0)}</p>
              <p style="margin: 3px 0; font-size: 8.5px;">Total Withdrawal: ${formatCurrency(totals.withdrawals || 0)}</p>
              <p style="margin: 3px 0; font-size: 8.5px; font-weight: bold;">Closing: ${formatCurrency(totals.closingBalance || 0)}</p>
            </div>
          </td>
        </tr>
      </table>
      ${bankAccount.address ? `<p style="margin: 5px 0 0; font-size: 9px;"><strong>Address:</strong> ${bankAccount.address}</p>` : ''}
    </div>
    ` : ''}

     <!-- Page Header (for subsequent pages) -->
     ${pageNumber > 1 ? `
     <div style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ccc;">
       <table style="width: 100%; font-size: 9px;">
         <tr>
           <td>
             <strong style="color: #1E3A8A;">${bankAccount.bankName || 'Bank'}</strong><br/>
             <span style="color: #666;">${bankAccount.branchName || 'Head Office'} Branch</span>
           </td>
          <td style="text-align: right;">
            <strong>Account No:</strong> ${bankAccount.accountNumber || 'N/A'}<br/>
            <strong>Page:</strong> ${pageNumber} of ${totalPages}
          </td>
        </tr>
      </table>
      <p style="margin: 5px 0 0; font-size: 9px; color: #666;">
        Continuation of statement from ${formatDate(periodStart)} to ${formatDate(periodEnd)}
      </p>
    </div>
    ` : ''}

    <!-- Transaction Table -->
    <div style="margin-top: ${pageNumber === 1 ? '5px' : '0'};">
      <table style="width: 100%; border-collapse: collapse; font-size: 8.5px; margin-bottom: 10px;">
        <thead>
          <tr style="background: linear-gradient(to right, #1E3A8A, #2D4A9E); color: white; height: 32px;">
            <th style="padding: 8px 5px; text-align: left; font-weight: 600; border-right: 1px solid #3a5bc7;">Date</th>
            <th style="padding: 8px 5px; text-align: left; font-weight: 600; border-right: 1px solid #3a5bc7;">Post Date</th>
            <th style="padding: 8px 5px; text-align: left; font-weight: 600; border-right: 1px solid #3a5bc7; width: 200px;">Description</th>
            <th style="padding: 8px 5px; text-align: right; font-weight: 600; border-right: 1px solid #3a5bc7;">Withdrawal (৳)</th>
            <th style="padding: 8px 5px; text-align: right; font-weight: 600; border-right: 1px solid #3a5bc7;">Deposit (৳)</th>
            <th style="padding: 8px 5px; text-align: right; font-weight: 600;">Balance (৳)</th>
          </tr>
        </thead>
        <tbody>
          ${pageTransactions.length > 0 ? pageTransactions.map((t, i) => {
            const isCredit = t.transactionType === 'credit' || (t.isTransfer && t.transferDetails?.direction === 'in');
            const amount = Number(t.amount) || 0;
            const withdraw = !isCredit ? amount : 0;
            const deposit = isCredit ? amount : 0;
            const balance = t.balanceAfter !== undefined ? t.balanceAfter : (totals.closingBalance || 0);
            
            return `
              <tr style="background: ${i % 2 === 0 ? '#f8f9fa' : 'white'}; border-bottom: 1px solid #eee;">
                <td style="padding: 6px 5px; border-right: 1px solid #eee;">${formatDate(t.date)}</td>
                <td style="padding: 6px 5px; border-right: 1px solid #eee;">${formatDate(t.postDate || t.date)}</td>
                <td style="padding: 6px 5px; border-right: 1px solid #eee; max-width: 200px; word-wrap: break-word; line-height: 1.3;">
                  <div style="font-weight: ${t.isImportant ? 'bold' : 'normal'};">
                    ${getDescription(t)}
                    ${t.referenceNo ? `<br/><small style="color: #666; font-size: 7.5px;">Ref: ${t.referenceNo}</small>` : ''}
                  </div>
                </td>
                <td style="padding: 6px 5px; text-align: right; border-right: 1px solid #eee; color: ${withdraw > 0 ? '#DC2626' : '#666'}; font-family: 'Courier New', monospace;">
                  ${withdraw > 0 ? formatCurrency(withdraw) : '-'}
                </td>
                <td style="padding: 6px 5px; text-align: right; border-right: 1px solid #eee; color: ${deposit > 0 ? '#059669' : '#666'}; font-family: 'Courier New', monospace;">
                  ${deposit > 0 ? formatCurrency(deposit) : '-'}
                </td>
                <td style="padding: 6px 5px; text-align: right; font-weight: ${i === pageTransactions.length - 1 ? 'bold' : 'normal'}; font-family: 'Courier New', monospace;">
                  ${formatCurrency(balance)}
                </td>
              </tr>
            `;
          }).join('') : `
            <tr>
              <td colspan="6" style="padding: 20px; text-align: center; color: #666; font-style: italic;">
                No transactions found for this period
              </td>
            </tr>
          `}

          <!-- Page info row (only if not last page) -->
          ${pageTransactions.length > 0 && pageNumber !== totalPages ? `
            <tr style="background: #f1f5f9; border-top: 1px solid #cbd5e1;">
              <td colspan="6" style="padding: 6px 5px; text-align: center; font-size: 8.5px; color: #666;">
                Page ${pageNumber} - Transactions ${startIndex + 1} to ${endIndex} of ${transactions.length} (Continued...)
              </td>
            </tr>
          ` : ''}

          <!-- Grand totals row (only on last page) -->
          ${pageTransactions.length > 0 && pageNumber === totalPages ? `
            <tr style="background: #f1f5f9; border-top: 3px solid #1E3A8A; font-weight: bold;">
              <td colspan="3" style="padding: 10px 5px; text-align: center; font-size: 10px; color: #1E3A8A;">
                TOTAL (Transactions 1 - ${transactions.length})
              </td>
              <td style="padding: 10px 5px; text-align: right; color: #DC2626; font-family: 'Courier New', monospace; font-size: 10px; border-top: 2px solid #DC2626;">
                ${formatCurrency(totals.withdrawals || 0)}
              </td>
              <td style="padding: 10px 5px; text-align: right; color: #059669; font-family: 'Courier New', monospace; font-size: 10px; border-top: 2px solid #059669;">
                ${formatCurrency(totals.deposits || 0)}
              </td>
              <td style="padding: 10px 5px; text-align: right; font-family: 'Courier New', monospace; font-size: 10px; font-weight: bold; border-top: 2px solid #1E3A8A;">
                ${formatCurrency(totals.closingBalance || 0)}
              </td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    </div>

    <!-- Grand totals on last page -->
    ${pageNumber === totalPages && transactions.length > 0 ? `
    <div style="margin-top: 20px; border-top: 2px solid #1E3A8A; padding-top: 10px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; background: #f0f7ff; padding: 10px; border-radius: 4px;">
        <tr>
          <td style="width: 25%; padding: 8px;">
            <div style="text-align: center;">
              <div style="font-weight: bold; color: #1E3A8A;">Opening Balance</div>
              <div style="font-size: 11px; font-weight: bold; margin-top: 3px;">${formatCurrency(totals.openingBalance || 0)}</div>
            </div>
          </td>
          <td style="width: 25%; padding: 8px;">
            <div style="text-align: center;">
              <div style="font-weight: bold; color: #059669;">Total Deposits</div>
              <div style="font-size: 11px; font-weight: bold; margin-top: 3px; color: #059669;">${formatCurrency(totals.deposits || 0)}</div>
            </div>
          </td>
          <td style="width: 25%; padding: 8px;">
            <div style="text-align: center;">
              <div style="font-weight: bold; color: #DC2626;">Total Withdrawals</div>
              <div style="font-size: 11px; font-weight: bold; margin-top: 3px; color: #DC2626;">${formatCurrency(totals.withdrawals || 0)}</div>
            </div>
          </td>
          <td style="width: 25%; padding: 8px;">
            <div style="text-align: center;">
              <div style="font-weight: bold; color: #1E3A8A;">Closing Balance</div>
              <div style="font-size: 11px; font-weight: bold; margin-top: 3px;">${formatCurrency(totals.closingBalance || 0)}</div>
            </div>
          </td>
        </tr>
      </table>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="position: absolute; bottom: 20px; left: 40px; right: 40px; font-size: 8px; color: #666; border-top: 1px solid #ddd; padding-top: 8px;">
      <table style="width: 100%;">
        <tr>
          <td>
            <div style="color: #1E3A8A; font-weight: bold;">${bankAccount.bankName || 'Bank'}</div>
            <div style="font-size: 7.5px; margin-top: 2px;">
              ${bankAccount.branchAddress || 'Head Office, Dhaka'} | Phone: ${bankAccount.telephone || '(+880) 2-XXXXXXX'}
            </div>
          </td>
          <td style="text-align: right; vertical-align: bottom;">
            <div style="font-family: 'Courier New', monospace; font-size: 8.5px;">
              Page ${pageNumber} of ${totalPages}
            </div>
            <div style="font-size: 7.5px; margin-top: 2px; color: #999;">
              Generated on: ${reportDate}
            </div>
          </td>
        </tr>
      </table>
      <div style="text-align: center; margin-top: 5px; font-size: 7px; color: #999; font-style: italic;">
        This is a computer-generated statement. No signature required.
      </div>
    </div>
  `;

  return { container, totalPages };
};

export const generateBankStatementPDF = async (statementData, options = {}) => {
  const { download = true, filename } = options;

  try {
    const totalPages = Math.ceil(statementData.transactions.length / ITEMS_PER_PAGE);
    const pdf = new jsPDF('p', 'pt', 'a4');
    
    for (let page = 1; page <= totalPages; page++) {
      const { container } = createBankStatementElement(statementData, page);
      
      // Add container to DOM temporarily
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      // Convert to canvas with better quality
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        imageTimeout: 0,
        removeContainer: true
      });

      // Remove container from DOM
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add new page if not first page
      if (page > 1) pdf.addPage();
      
      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, `page${page}`, 'FAST');
    }

    const finalFilename = filename || `Bank_Statement_${statementData.bankAccount?.accountNumber || 'account'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    if (download) {
      pdf.save(finalFilename);
    }

    return { 
      success: true, 
      filename: finalFilename, 
      pdf,
      totalPages,
      pageSize: 'A4',
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return { 
      success: false, 
      error: error.message,
      stack: error.stack 
    };
  }
};