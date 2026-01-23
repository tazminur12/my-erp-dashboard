import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const FLAG_URL = 'https://flagcdn.com/w160/bd.png';

function formatMobileBd(val) {
  if (!val || typeof val !== 'string') return 'N/A';
  const digits = val.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('01')) return `+880 ${digits.slice(0, 4)}${digits.slice(4, 8)}${digits.slice(8)}`;
  if (digits.length >= 10) return `+880 ${digits.slice(-11)}`;
  return val.trim() || 'N/A';
}

function getKsaNumber(haji) {
  const ksa = haji.ksaMobile || haji.ksaPhone || haji.saudiMobile;
  if (ksa && typeof ksa === 'string' && ksa.trim()) return ksa.trim();
  const wa = haji.whatsappNo || '';
  if (wa && /^\+966|^966/.test(wa.replace(/\s/g, ''))) return wa.trim();
  return 'N/A';
}

function getQRDataUrl(haji) {
  const passportNumber = haji.passportNumber || '';
  const searchUrl = `https://pilgrim.hajj.gov.bd/web/pilgrim-search?q=${encodeURIComponent(passportNumber)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(searchUrl)}`;
}

/**
 * Build HTML for one BANGLADESH / SALMA AIR TRAVELS card.
 * @param {Object} haji - Haji/passenger data
 * @returns {string} HTML string
 */
function buildCardHTML(haji) {
  const name = (haji.name || 'N/A').toUpperCase();
  const ppNo = haji.passportNumber || 'N/A';
  const ps = haji.upazila || haji.policeStation || haji.thana || 'N/A';
  const dist = haji.district || 'N/A';
  const mob = formatMobileBd(haji.mobile || haji.phone);
  const ksa = getKsaNumber(haji);
  const photoUrl = haji.photo || haji.photoUrl || haji.image || '';
  const qrSrc = getQRDataUrl(haji);

  return `
    <div class="haji-card" style="
      width: 380px;
      min-height: 220px;
      border: 2px solid #000;
      background: #fff;
      padding: 14px 16px;
      box-sizing: border-box;
      font-family: Arial, 'Noto Sans Bengali', sans-serif;
    ">
      <div style="margin-bottom: 8px;">
        <div style="font-size: 24px; font-weight: bold; color: #c00; letter-spacing: 0.5px;">BANGLADESH</div>
        <div style="font-size: 15px; font-weight: bold; color: #0066cc; letter-spacing: 0.5px;">SALMA AIR TRAVELS</div>
      </div>
      <div style="display: flex; justify-content: space-between; gap: 14px;">
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: bold; color: #000; margin-bottom: 3px;">${escapeHtml(name)}</div>
          <div style="font-size: 11px; font-weight: bold; color: #000; margin-bottom: 2px;">P.P NO: ${escapeHtml(ppNo)}</div>
          <div style="font-size: 11px; font-weight: bold; color: #000; margin-bottom: 2px;">P.S: ${escapeHtml(ps)}</div>
          <div style="font-size: 11px; font-weight: bold; color: #000; margin-bottom: 2px;">DIST: ${escapeHtml(dist)}</div>
          <div style="font-size: 11px; font-weight: bold; color: #000; margin-bottom: 2px;">MOB: ${escapeHtml(mob)}</div>
          <div style="font-size: 11px; font-weight: bold; color: #c00;">KSA: ${escapeHtml(ksa)}</div>
        </div>
        <div style="flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <img src="${FLAG_URL}" alt="BD Flag" crossorigin="anonymous" style="width: 52px; height: 35px; object-fit: cover; display: block;" />
          ${photoUrl
            ? `<img src="${photoUrl.replace(/"/g, '&quot;')}" alt="Photo" crossorigin="anonymous" style="width: 60px; height: 60px; object-fit: cover; display: block; border: 1px solid #ccc;" />`
            : `<div style="width: 60px; height: 60px; background: #e5e7eb; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #6b7280;">No Photo</div>`
          }
          <img src="${qrSrc}" alt="QR" crossorigin="anonymous" style="width: 44px; height: 44px; display: block; object-fit: contain;" />
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = String(s);
  return div.innerHTML;
}

/**
 * Generate PDF with one or two BANGLADESH / SALMA AIR TRAVELS cards per page.
 * @param {Object} haji - Haji/passenger data (name, passportNumber, district, upazila, mobile, etc.)
 * @param {Object} opts - { download?: boolean, copies?: number }
 * @returns {Promise<{ success: boolean, filename?: string, error?: string }>}
 */
export async function generateHajiCardPDF(haji, opts = {}) {
  const { download = true, copies = 2 } = opts;

  const cardHtml = buildCardHTML(haji);
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 420px;
    background: #fff;
    padding: 24px;
    box-sizing: border-box;
  `;
  const cards = Array.from({ length: Math.max(1, copies) }, () => cardHtml).join('');
  container.innerHTML = `
    <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
    <div style="display: flex; flex-direction: column; gap: 14px;">${cards}</div>
  `;
  document.body.appendChild(container);

  try {
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 1000));

    const canvas = await html2canvas(container, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: false,
      imageTimeout: 20000,
      letterRendering: true,
      pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
      onclone: (doc, el) => {
        el.querySelectorAll('img').forEach((img) => {
          img.setAttribute('crossorigin', 'anonymous');
        });
      },
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/jpeg', 1);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const imgW = canvas.width;
    const imgH = canvas.height;
    const margin = 10;
    const maxW = pw - 2 * margin;
    const maxH = ph - 2 * margin;
    let w = maxW;
    let h = (imgH * maxW) / imgW;
    if (h > maxH) {
      h = maxH;
      w = (imgW * maxH) / imgH;
    }
    const x = (pw - w) / 2;
    const y = (ph - h) / 2;
    pdf.addImage(imgData, 'JPEG', x, y, w, h, undefined, 'NONE');

    const safeName = (haji.name || 'haji').replace(/[^a-zA-Z0-9\u0980-\u09FF\s-]/g, '_').trim().slice(0, 40);
    const filename = `BANGLADESH_SALMA_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;

    if (download) {
      pdf.save(filename);
    }

    return { success: true, filename, pdf };
  } catch (err) {
    if (container.parentNode) document.body.removeChild(container);
    console.error('Haji card PDF error:', err);
    return { success: false, error: err?.message || 'PDF generation failed' };
  }
}
