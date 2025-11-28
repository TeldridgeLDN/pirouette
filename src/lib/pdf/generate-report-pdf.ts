/**
 * PDF Report Generator
 * 
 * Generates professional PDF reports for analysis results.
 * Used by /api/reports/[id]/pdf endpoint.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// Types
// ============================================================================

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  dimension: string;
}

interface ReportData {
  id: string;
  url: string;
  created_at: string;
  overall_score: number;
  colors_score: number | null;
  whitespace_score: number | null;
  complexity_score: number | null;
  typography_score: number | null;
  layout_score: number | null;
  cta_score: number | null;
  hierarchy_score: number | null;
  recommendations: Recommendation[];
  screenshot_url?: string;
}

interface PDFOptions {
  includeScreenshot?: boolean;
  includeAllRecommendations?: boolean;
  maxRecommendations?: number;
}

// ============================================================================
// Constants
// ============================================================================

const COLORS = {
  primary: '#4F46E5', // Indigo
  secondary: '#7C3AED', // Purple
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Red
  slate: '#64748B',
  slateLight: '#94A3B8',
  slateDark: '#1E293B',
  white: '#FFFFFF',
  background: '#F8FAFC',
};

const DIMENSION_NAMES: Record<string, string> = {
  colors_score: 'Colours & Contrast',
  whitespace_score: 'Whitespace',
  complexity_score: 'Complexity',
  typography_score: 'Typography',
  layout_score: 'Layout',
  cta_score: 'Call to Action',
  hierarchy_score: 'Visual Hierarchy',
};

// ============================================================================
// Helper Functions
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.danger;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Needs Work';
  return 'Critical';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getPriorityLabel(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function getEffortLabel(effort: string): string {
  switch (effort) {
    case 'low': return '~15 mins';
    case 'medium': return '~1 hour';
    case 'high': return '~4+ hours';
    default: return effort;
  }
}

// ============================================================================
// PDF Generator
// ============================================================================

export async function generateReportPDF(
  report: ReportData,
  options: PDFOptions = {}
): Promise<Buffer> {
  const {
    includeAllRecommendations = false,
    maxRecommendations = 5,
  } = options;

  // Create PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // ========================================
  // Header
  // ========================================
  
  // Background gradient effect (simplified as solid color)
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Logo placeholder (P for Pirouette)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 12, 12, 12, 2, 2, 'F');
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('P', margin + 4, 21);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Pirouette', margin + 16, 21);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Design Analysis Report', pageWidth - margin, 21, { align: 'right' });

  // URL and date
  doc.setFontSize(9);
  doc.text(report.url, margin, 38);
  doc.text(`Analysed: ${formatDate(report.created_at)}`, pageWidth - margin, 38, { align: 'right' });

  yPos = 60;

  // ========================================
  // Overall Score Section
  // ========================================
  
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, 'F');

  // Score circle (simplified)
  const scoreColor = getScoreColor(report.overall_score);
  doc.setDrawColor(scoreColor);
  doc.setLineWidth(2);
  doc.circle(margin + 20, yPos + 17.5, 12, 'S');

  // Score number
  doc.setTextColor(scoreColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(String(report.overall_score), margin + 20, yPos + 20, { align: 'center' });

  // Score label
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(14);
  doc.text('Overall Score', margin + 45, yPos + 14);
  
  doc.setFontSize(11);
  doc.setTextColor(scoreColor);
  doc.text(getScoreLabel(report.overall_score), margin + 45, yPos + 24);

  // Score interpretation
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(9);
  const interpretation = report.overall_score >= 80 
    ? 'Your landing page is performing well across most dimensions.'
    : report.overall_score >= 60
      ? 'There are several areas that could be improved.'
      : 'Significant improvements are needed for better conversion.';
  doc.text(interpretation, pageWidth - margin, yPos + 20, { align: 'right' });

  yPos += 45;

  // ========================================
  // Dimension Scores Table
  // ========================================
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dimension Breakdown', margin, yPos);
  yPos += 8;

  const dimensionData = Object.entries(DIMENSION_NAMES)
    .map(([key, name]) => {
      const score = report[key as keyof ReportData] as number | null;
      return {
        name,
        score: score ?? 0,
        color: score !== null ? getScoreColor(score) : COLORS.slateLight,
      };
    })
    .filter(d => d.score !== null);

  // Create table
  autoTable(doc, {
    startY: yPos,
    head: [['Dimension', 'Score', 'Rating']],
    body: dimensionData.map(d => [
      d.name,
      `${d.score}/100`,
      getScoreLabel(d.score),
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [100, 116, 139],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40 },
    },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      // Color the score column based on value
      if (data.section === 'body' && data.column.index === 1) {
        const scoreText = data.cell.raw as string;
        const score = parseInt(scoreText);
        if (score >= 80) {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        } else if (score >= 60) {
          data.cell.styles.textColor = [245, 158, 11]; // Amber
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // Red
        }
      }
    },
  });

  // Get the final Y position after the table
  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // ========================================
  // Recommendations Section
  // ========================================
  
  const recommendations = includeAllRecommendations 
    ? report.recommendations 
    : report.recommendations.slice(0, maxRecommendations);

  if (recommendations.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Recommendations', margin, yPos);
    yPos += 8;

    const recData = recommendations.map((rec, index) => [
      `${index + 1}.`,
      rec.title,
      getPriorityLabel(rec.priority),
      getEffortLabel(rec.effort),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Recommendation', 'Priority', 'Effort']],
      body: recData,
      theme: 'plain',
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [100, 116, 139],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 100 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: margin, right: margin },
      didParseCell: (data) => {
        // Color priority column
        if (data.section === 'body' && data.column.index === 2) {
          const priority = (data.cell.raw as string).toLowerCase();
          if (priority === 'high') {
            data.cell.styles.textColor = [239, 68, 68]; // Red
          } else if (priority === 'medium') {
            data.cell.styles.textColor = [245, 158, 11]; // Amber
          } else {
            data.cell.styles.textColor = [16, 185, 129]; // Emerald
          }
        }
      },
    });

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // ========================================
  // Footer
  // ========================================
  
  // Add footer on each page
  // Type assertion needed for jspdf-autotable compatibility
  const totalPages = (doc as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    (doc as unknown as { setPage: (n: number) => void }).setPage(i);
    
    // Footer line
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text('Generated by Pirouette • pirouette.design', margin, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  // Return as Buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

