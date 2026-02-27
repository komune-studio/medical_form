import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import LogoRangka from 'assets/img/Logo_rangka.png';
import Mascot from 'assets/img/Mascot.png';

export default class MedicalHistoryPDFGenerator {

  static calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return 'Invalid date';
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  /**
   * ✅ KEY FIX: Use JPEG + low quality → keeps file tiny (same as original ~40KB)
   * Canvas draws image scaled DOWN before encoding → massive size reduction
   */
  static loadImageAsBase64 = (src, maxPx = 300, useJpeg = false) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const scale  = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width  = Math.round(img.naturalWidth  * scale);
          canvas.height = Math.round(img.naturalHeight * scale);
          const ctx = canvas.getContext('2d');
          // For PNG (logos with transparency): fill white background first when using JPEG
          // For PNG assets: always use PNG format to preserve transparency
          if (useJpeg) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.75);
            resolve({ base64, width: img.naturalWidth, height: img.naturalHeight });
          } else {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/png');
            resolve({ base64, width: img.naturalWidth, height: img.naturalHeight });
          }
        } catch (e) {
          console.warn('Canvas error:', e);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  static generateProgressPDF = async (reportData) => {
    try {
      if (!reportData) throw new Error('Invalid report data provided.');
      const { patient, sessions } = reportData;
      if (!patient)                          throw new Error('Patient information not found.');
      if (!sessions || sessions.length === 0) throw new Error('No medical history records found for this patient. Please add treatment records first.');

      // Pre-load brand images (scaled down → small file)
      const [logoResult, mascotResult] = await Promise.all([
        this.loadImageAsBase64(LogoRangka, 400, false),  // PNG — preserve transparency
        this.loadImageAsBase64(Mascot,     300, true),   // JPEG — no transparency needed
      ]);

      const doc        = new jsPDF();
      const pageWidth  = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ══════════════════════════════════════════════════════════
      // HEADER — Logo left · Title right of logo
      // ══════════════════════════════════════════════════════════
      const LOGO_X = 10;
      const LOGO_Y = 7;
      const LOGO_W = 40;   // bigger logo
      const LOGO_H = 20;

      if (logoResult) {
        const ratio = logoResult.width / logoResult.height;
        let lw = LOGO_W, lh = LOGO_W / ratio;
        if (lh > LOGO_H) { lh = LOGO_H; lw = LOGO_H * ratio; }
        doc.addImage(logoResult.base64, 'PNG', LOGO_X, LOGO_Y, lw, lh);
      }

      // Title starts right of logo, centred in remaining width
      const titleStartX  = LOGO_X + LOGO_W + 6;
      const titleCenterX = titleStartX + (pageWidth - titleStartX - 10) / 2;
      const titleY       = LOGO_Y + LOGO_H / 2 + 3;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Treatment Plan & Progress Report:', titleCenterX, titleY, { align: 'center' });

      // Underline
      const lineY = LOGO_Y + LOGO_H + 5;
      doc.setLineWidth(0.8);
      doc.line(10, lineY, pageWidth - 10, lineY);

      // ══════════════════════════════════════════════════════════
      // INFO BLOCK — 3 columns (spacious layout like Image 2)
      //
      //  A: Client's Data   x=12,  width ~85mm
      //  B: Assessment      x=105, width ~75mm
      //  C: Mascot+quote    x=168
      // ══════════════════════════════════════════════════════════
      const A_X       = 12;
      const A_LBL_W   = 38;   // wider label col → value starts further right
      const A_VAL_MAX = 52;   // max wrap width for col A values
      const B_X       = 105;  // assessment starts at ~half page
      const B_LBL_W   = 50;   // wider label col B
      const B_VAL_MAX = 38;   // max wrap width for col B values
      const C_X       = 168;

      const ROW_H     = 7;    // row height — more breathing room
      const FONT_LBL  = 9.5;  // label font size
      const FONT_VAL  = 9.5;  // value font size

      let startY = lineY + 10;

      // — Column headings —
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("Client's Data:",     A_X, startY);
      doc.text("Rangka Assessment:", B_X, startY);

      let aY = startY + 8;
      let bY = startY + 8;

      // — Col A: Client rows —
      const clientRows = [
        ['Patient Name:',  patient.name  || '-'],
        ['Phone Number:',  patient.phone || '-'],
        ['Email Address:', patient.email || '-'],
        ['Age:',           patient.date_of_birth ? `${this.calculateAge(patient.date_of_birth)} years` : '-'],
        ['Height (cm):',   patient.height ? String(patient.height) : '-'],
        ['Weight (kg):',   patient.weight ? String(patient.weight) : '-'],
      ];

      clientRows.forEach(([lbl, val]) => {
        doc.setFontSize(FONT_LBL);
        doc.setFont('helvetica', 'bold');
        doc.text(lbl, A_X, aY);
        doc.setFontSize(FONT_VAL);
        doc.setFont('helvetica', 'normal');
        const valLines = doc.splitTextToSize(String(val), A_VAL_MAX);
        valLines.forEach((line, i) => doc.text(line, A_X + A_LBL_W, aY + i * 5));
        aY += Math.max(ROW_H, valLines.length * 5);
      });

      // — Col B: Assessment rows —
      const firstSession = sessions[0] || {};
      const assessRows = [
        ['Assessment Date:',        firstSession.appointment_date
          ? new Date(firstSession.appointment_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
          : '-'],
        ['Assessment Therapist:',   firstSession.staff_name              || '-'],
        ['Service Type:',           firstSession.service_type            || '-'],
        ['Injury Type:',            firstSession.injury_type             || '-'],
        ['Area Concern:',           firstSession.area_concern            || '-'],
        ['Diagnosis:',              firstSession.diagnosis_result        || '-'],
        ['Range of Motion Impact:', firstSession.range_of_motion_impact  || '-'],
        ['Recovery Goals:',         firstSession.recovery_goals          || '-'],
        ['Expected Recovery Time:', firstSession.expected_recovery_time  || '-'],
      ];

      assessRows.forEach(([lbl, val]) => {
        doc.setFontSize(FONT_LBL);
        doc.setFont('helvetica', 'bold');
        doc.text(lbl, B_X, bY);
        doc.setFontSize(FONT_VAL);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(String(val), B_VAL_MAX);
        lines.forEach((line, i) => doc.text(line, B_X + B_LBL_W, bY + i * 5));
        bY += Math.max(ROW_H, lines.length * 5);
      });

      // — Col C: Mascot + quote —
      if (mascotResult) {
        const MW = 28, MH = 38;
        const ratio = mascotResult.width / mascotResult.height;
        let mw = MW, mh = MW / ratio;
        if (mh > MH) { mh = MH; mw = MH * ratio; }
        doc.addImage(mascotResult.base64, 'JPEG', C_X, startY, mw, mh);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(80);
        let qy = startY + mh + 3;
        ["Stay focused, stay strong.", "We've Got Your Back!"].forEach(line => {
          doc.text(line, C_X, qy); qy += 4;
        });
        doc.setTextColor(0);
      }

      let yPos = Math.max(aY, bY) + 6;

      // ══════════════════════════════════════════════════════════
      // HORIZONTAL RULE
      // ══════════════════════════════════════════════════════════
      doc.setLineWidth(0.4);
      doc.line(10, yPos, pageWidth - 10, yPos);
      yPos += 7;

      // ══════════════════════════════════════════════════════════
      // PROGRESS TABLE TITLE + LEGEND
      // ══════════════════════════════════════════════════════════
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('The Progress Table', pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80);
      doc.text('see how you progress over the week', pageWidth / 2, yPos, { align: 'center' });
      doc.setTextColor(0);

      const legendY = yPos + 3;
      const legendX = pageWidth - 52;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      [
        { color: [255,77,77],  label: ': Treatment + Rest' },
        { color: [255,193,7],  label: ': Treatment + Exercise' },
        { color: [76,175,80],  label: ': Back to Sports Preparation' },
      ].forEach((item, i) => {
        const ly = legendY + i * 4;
        doc.setFillColor(...item.color);
        doc.circle(legendX - 2.5, ly - 0.8, 1.2, 'F');
        doc.text(item.label, legendX, ly);
      });

      yPos = legendY + 14;

      // ══════════════════════════════════════════════════════════
      // PROGRESS TABLE
      // ══════════════════════════════════════════════════════════
      const tableData = sessions.map((s, idx) => {
        let fmtDate = '-';
        try {
          const d = new Date(s.appointment_date);
          if (!isNaN(d.getTime())) fmtDate = d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
        } catch (_) {}
        return [
          String(idx + 1),
          fmtDate,
          s.staff_name         || '-',
          s.objective_progress || '-',
          s.exercise           || '-',
          s.recovery_tips      || '-',
          s.pain_before != null ? String(s.pain_before) : '-',
          s.pain_after  != null ? String(s.pain_after)  : '-',
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [[
          'Session\n#', 'Session\nDate', 'Rangka\nTherapist',
          'Objective\nProgress', 'Home\nExercise', 'Recovery\nTips',
          'Pre-\nTreatment', 'Post-\nTreatment',
        ]],
        body: tableData,
        theme: 'grid',
        styles: {
          font: 'helvetica', fontSize: 7.5,
          cellPadding: { top:3, right:2, bottom:3, left:2 },
          lineColor: [220,220,220], lineWidth: 0.3, overflow: 'linebreak',
        },
        headStyles: {
          fillColor:[250,250,250], textColor:[0,0,0], fontStyle:'bold',
          fontSize:7.5, halign:'center', valign:'middle', minCellHeight:10,
        },
        bodyStyles: { fontSize:7, textColor:[40,40,40], valign:'top' },
        columnStyles: {
          0: { cellWidth:12, halign:'center', fontStyle:'bold' },
          1: { cellWidth:20, halign:'center' },
          2: { cellWidth:22, halign:'left' },
          3: { cellWidth:38, halign:'left' },
          4: { cellWidth:32, halign:'left' },
          5: { cellWidth:30, halign:'left' },
          6: { cellWidth:14, halign:'center', fillColor:[255,250,235] },
          7: { cellWidth:14, halign:'center', fillColor:[240,255,245] },
        },
        margin: { left:12, right:12 },
        tableWidth: 'auto',
        didDrawCell: (data) => {
          if ((data.column.index === 6 || data.column.index === 7) && data.section === 'body') {
            const cv = data.cell.raw;
            if (cv === '-' || cv == null) return;
            const v = parseFloat(cv);
            if (isNaN(v)) return;
            const color = v <= 3 ? [76,175,80] : v <= 6 ? [255,193,7] : [255,77,77];
            const pt  = data.cell.padding('top');
            const fs  = 7;
            const ty  = data.cell.y + pt + fs * 0.352778;
            const tw  = doc.getTextWidth(String(cv));
            const cx  = data.cell.x + data.cell.width / 2 + tw / 2 + 2.5;
            const cy  = ty - (fs * 0.352778) / 2;
            doc.setFillColor(...color);
            doc.circle(cx, cy, 1.1, 'F');
          }
        },
      });

      // ══════════════════════════════════════════════════════════
      // BODY ANNOTATION IMAGES
      // ══════════════════════════════════════════════════════════
      yPos = doc.lastAutoTable.finalY + 15;

      for (let i = 0; i < sessions.length; i++) {
        const imageData = sessions[i].body_annotation_base64 || sessions[i].body_annotation_url;
        if (!imageData || !imageData.trim()) continue;

        try {
          if (yPos > pageHeight - 80) { doc.addPage(); yPos = 20; }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Session ${i + 1} - Body Annotation:`, 20, yPos);
          yPos += 7;

          if (imageData.startsWith('data:image')) {
            const imgX = (pageWidth - 120) / 2;
            doc.addImage(imageData, 'JPEG', imgX, yPos, 120, 100, undefined, 'FAST');
            yPos += 110;
          } else {
            const img = await new Promise((res, rej) => {
              const el = new window.Image();
              el.crossOrigin = 'Anonymous';
              el.onload  = () => res(el);
              el.onerror = () => rej(new Error('load failed'));
              el.src = imageData;
            });
            let iw = 120, ih = (img.height * 120) / img.width;
            if (ih > 100) { ih = 100; iw = (img.width * 100) / img.height; }
            doc.addImage(img, 'JPEG', (pageWidth - iw) / 2, yPos, iw, ih, undefined, 'FAST');
            yPos += ih + 10;
          }
        } catch (err) {
          doc.setFontSize(8); doc.setFont('helvetica','italic'); doc.setTextColor(150,150,150);
          doc.text('(Body annotation image unavailable)', 20, yPos);
          doc.setTextColor(0); yPos += 10;
        }
      }

      // ── Save ──────────────────────────────────────────────────
      const safeName = (patient.name || 'patient').replace(/[^a-zA-Z0-9\s-]/g,'').replace(/\s+/g,'-');
      doc.save(`progress-report-${patient.patient_code || safeName}-${new Date().toISOString().split('T')[0]}.pdf`);
      return { success: true };

    } catch (error) {
      console.error('Error generating PDF:', error);
      if (error.message) throw error;
      throw new Error('Failed to generate PDF report. Please try again.');
    }
  }
}