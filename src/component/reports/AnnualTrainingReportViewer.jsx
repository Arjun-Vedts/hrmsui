import React, { useState } from "react";
import styles from '../../datatable/SmartDatatable.module.css';
import { FaRegFileExcel, FaRegFilePdf } from "react-icons/fa6";
import tabstyles from '../../datatable/SmartDatatable.module.css';
import { ExportUtils } from "../../datatable/exportUtils";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pdfFonts from "../../assets/fonts/vfs_fonts";
import { getCurrentRegularDate } from "../utils/formatterUtils";

const AnnualTrainingReportViewer = ({ reportData = [] }) => {

  const totals = reportData.reduce((acc, row) => {
    acc.withinLab += row.withinLab || 0;
    acc.otherLabs += row.otherLabs || 0;
    acc.outsideWithinIndia += row.outsideWithinIndia || 0;
    acc.outsideForeignAgency += row.outsideForeignAgency || 0;
    acc.subTotal += row.subTotal || 0;
    acc.drdsTni += row.drdsTni || 0;
    acc.drdsRacBoard += row.drdsRacBoard || 0;
    acc.drdsOpen += row.drdsOpen || 0;
    acc.drdsTotal += row.drdsTotal || 0;
    acc.drdsMale += row.drdsMale || 0;
    acc.drdsFemale += row.drdsFemale || 0;
    acc.drtcTni += row.drtcTni || 0;
    acc.drtcCeptamBoard += row.drtcCeptamBoard || 0;
    acc.drtcOpen += row.drtcOpen || 0;
    acc.drtcMale += row.drtcMale || 0;
    acc.drtcFemale += row.drtcFemale || 0;
    acc.drtcTotal += row.drtcTotal || 0;
    acc.adminAlliedTni += row.adminAlliedTni || 0;
    acc.adminAlliedOpen += row.adminAlliedOpen || 0;
    acc.adminAlliedMale += row.adminAlliedMale || 0;
    acc.adminAlliedFemale += row.adminAlliedFemale || 0;
    acc.adminAlliedTotal += row.adminAlliedTotal || 0;
    acc.othersTotal += row.othersTotal || 0;
    acc.othersMale += row.othersMale || 0;
    acc.othersFemale += row.othersFemale || 0;
    return acc;
  }, {
    withinLab: 0,
    otherLabs: 0,
    outsideWithinIndia: 0,
    outsideForeignAgency: 0,
    subTotal: 0,
    drdsTni: 0,
    drdsRacBoard: 0,
    drdsOpen: 0,
    drdsMale: 0,
    drdsFemale: 0,
    drdsTotal: 0,
    drtcTni: 0,
    drtcCeptamBoard: 0,
    drtcOpen: 0,
    drtcMale: 0,
    drtcFemale: 0,
    drtcTotal: 0,
    adminAlliedTni: 0,
    adminAlliedOpen: 0,
    adminAlliedMale: 0,
    adminAlliedFemale: 0,
    adminAlliedTotal: 0,
    othersTotal: 0,
    othersMale: 0,
    othersFemale: 0
  });

  const handleExport = (type) => {

    const exportRows = reportData.map((row, index) => ([
      index + 1,
      row.course,
      row.withinLab || 0,
      row.otherLabs || 0,
      row.outsideWithinIndia || 0,
      row.outsideForeignAgency || 0,
      row.subTotal || 0,

      row.drdsTni || 0,
      row.drdsRacBoard || 0,
      row.drdsOpen || 0,
      row.drdsTotal || 0,
      row.drdsMale || 0,
      row.drdsFemale || 0,

      row.drtcTni || 0,
      row.drtcCeptamBoard || 0,
      row.drtcOpen || 0,
      row.drtcTotal || 0,
      row.drtcMale || 0,
      row.drtcFemale || 0,

      row.adminAlliedTni || 0,
      row.adminAlliedOpen || 0,
      row.adminAlliedTotal || 0,
      row.adminAlliedMale || 0,
      row.adminAlliedFemale || 0,

      row.othersTotal || 0,
      row.othersMale || 0,
      row.othersFemale || 0
    ]));

    // ✅ GRAND TOTAL ROW
    exportRows.push([
      "",
      "GRAND TOTAL",
      totals.withinLab,
      totals.otherLabs,
      totals.outsideWithinIndia,
      totals.outsideForeignAgency,
      totals.subTotal,

      totals.drdsTni,
      totals.drdsRacBoard,
      totals.drdsOpen,
      totals.drdsTotal,
      totals.drdsMale,
      totals.drdsFemale,

      totals.drtcTni,
      totals.drtcCeptamBoard,
      totals.drtcOpen,
      totals.drtcTotal,
      totals.drtcMale,
      totals.drtcFemale,

      totals.adminAlliedTni,
      totals.adminAlliedOpen,
      totals.adminAlliedTotal,
      totals.adminAlliedMale,
      totals.adminAlliedFemale,

      totals.othersTotal,
      totals.othersMale,
      totals.othersFemale
    ]);

    const headers = [
      "SN", "Course Name", "Within Lab", "Other Labs",
      "Outside (India)", "Outside (Foreign)", "Sub Total",

      "DRDS TNI", "DRDS RAC", "DRDS Open", "DRDS Total", "DRDS M/F",

      "DRTC TNI", "DRTC CEPTAM", "DRTC Open", "DRTC Total", "DRTC M/F",

      "Admin TNI", "Admin Open", "Admin Total", "Admin M/F",

      "Others Total", "Others M/F"
    ];

    if (type === "excel") exportToExcel(headers, exportRows);
    if (type === "pdf") exportToPDF(headers, exportRows);
  };

  const exportToExcel = (headers, rows) => {
    const TOTAL_COLS = 27;
    const HEADER_ROW_1 = 2;
    const HEADER_ROW_2 = 3;
    const DATA_START = 4;
    const lastRow = DATA_START + rows.length - 1; // grand total row

    const headerRow1 = [
      "SN", "Course Name", "Within Lab (No.)", "Other Labs (No.)",
      "Outside (Within India)", "Outside (Foreign Agency)", "Sub Total",
      "No. of Participants (DRDS)", "", "", "", "", "",
      "No. of Participants (DRTC)", "", "", "", "", "",
      "No. of Participants (Admin & Allied)", "", "", "", "",
      "No. of Participants (Others)", "", ""
    ];

    const headerRow2 = [
      "", "", "", "", "", "", "",
      "TNI (No. & %)", "RAC Board Recomm.", "Open (No. & %)", "Total", "Male", "Female",
      "TNI (No. & %)", "CEPTAM Board Recomm.", "Open (No. & %)", "Total", "Male", "Female",
      "TNI (No. & %)", "Open (No. & %)", "Total", "Male", "Female",
      "Total", "Male", "Female"
    ];

    const ws = XLSX.utils.aoa_to_sheet([
      ["Annual Training Report"],
      [],
      headerRow1,
      headerRow2,
      ...rows
    ]);

    // Put the GRAND TOTAL label in the top-left cell of the merged range (column A)
    ws[XLSX.utils.encode_cell({ r: lastRow, c: 0 })] = { t: "s", v: "GRAND TOTAL" };
    ws[XLSX.utils.encode_cell({ r: lastRow, c: 1 })] = { t: "s", v: "" };

    // ── Merges ────────────────────────────────────────────────
    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: TOTAL_COLS - 1 } },      // title
      { s: { r: 2, c: 7 }, e: { r: 2, c: 12 } },                  // DRDS
      { s: { r: 2, c: 13 }, e: { r: 2, c: 18 } },                 // DRTC
      { s: { r: 2, c: 19 }, e: { r: 2, c: 23 } },                 // Admin
      { s: { r: 2, c: 24 }, e: { r: 2, c: 26 } },                 // Others
      { s: { r: lastRow, c: 0 }, e: { r: lastRow, c: 1 } },       // GRAND TOTAL label
    ];
    for (let c = 0; c <= 6; c++) {
      merges.push({ s: { r: 2, c }, e: { r: 3, c } });            // vertical header merges
    }
    ws["!merges"] = merges;

    // ── Style helpers ─────────────────────────────────────────
    const border = (rgb) => ({
      top: { style: "thin", color: { rgb } },
      bottom: { style: "thin", color: { rgb } },
      left: { style: "thin", color: { rgb } },
      right: { style: "thin", color: { rgb } },
    });

    // Header colour per column group
    const groupColor = (c) => {
      if (c <= 6) return "0163D6";   // fixed columns
      if (c <= 12) return "1D4ED8";  // DRDS
      if (c <= 18) return "0F766E";  // DRTC
      if (c <= 23) return "7C3AED";  // Admin & Allied
      return "B45309";               // Others
    };

    // Make sure every cell in the grid exists so styles/borders apply to merged areas too
    const ensureCell = (r, c) => {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };
      return ws[addr];
    };

    for (let r = 0; r <= lastRow; r++) {
      if (r === 1) continue; // spacer row
      for (let c = 0; c < TOTAL_COLS; c++) {
        const cell = ensureCell(r, c);

        // Title
        if (r === 0) {
          cell.s = {
            font: { name: "Arial", sz: 16, bold: true, color: { rgb: "0163D6" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "F2F2F2" } },
            border: border("BFC7D1"),
          };
          continue;
        }

        // Headers
        if (r === HEADER_ROW_1 || r === HEADER_ROW_2) {
          cell.s = {
            font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: groupColor(c) } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: border("FFFFFF"),
          };
          continue;
        }

        // Grand total row
        if (r === lastRow) {
          cell.s = {
            font: {
              name: "Arial",
              sz: c <= 1 ? 12 : 10,
              bold: true,
              color: { rgb: "000000" }
            },
            fill: { fgColor: { rgb: "FFF2CC" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: border("BFC7D1"),
          };
          continue;
        }

        // Data rows
        cell.s = {
          font: { name: "Arial", sz: 10, color: { rgb: "334155" } },
          alignment: {
            horizontal: c === 1 ? "left" : "center",
            vertical: "center",
            wrapText: c === 1,
            indent: c === 1 ? 1 : 0,
          },
          border: border("D9DEE5"),
          ...(r % 2 === 1 ? { fill: { fgColor: { rgb: "F8FAFC" } } } : {}),
        };
        if (typeof cell.v === "number") cell.z = "0";
      }
    }

    // ── Column widths (content-aware for Course Name) ─────────
    const longestCourse = rows.reduce(
      (max, r) => Math.max(max, String(r[1] ?? "").length), 12
    );
    const courseWidth = Math.min(Math.max(longestCourse + 4, 30), 55);

    ws["!cols"] = [
      { wch: 6 },            // SN
      { wch: courseWidth },  // Course Name
      { wch: 12 },           // Within Lab
      { wch: 12 },           // Other Labs
      { wch: 14 },           // Outside India
      { wch: 16 },           // Outside Foreign
      { wch: 11 },           // Sub Total
      ...Array(6).fill({ wch: 13 }),  // DRDS
      ...Array(6).fill({ wch: 13 }),  // DRTC
      ...Array(5).fill({ wch: 13 }),  // Admin & Allied
      ...Array(3).fill({ wch: 11 }),  // Others
    ];

    // ── Row heights ───────────────────────────────────────────
    ws["!rows"] = [
      { hpt: 30 },   // title
      { hpt: 8 },    // spacer
      { hpt: 30 },   // header 1
      { hpt: 45 },   // header 2 (wrapped text)
      ...rows.map((_, i) => ({ hpt: i === rows.length - 1 ? 24 : 22 })),
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws, "Annual Training Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }),
      "Annual_Training_Report.xlsx"
    );
  };


  const exportToPDF = (headers, rows) => {

    const COL_COUNT = 27; // was 28, the table has 27 columns (0-26)

    const doc = new jsPDF({ orientation: "landscape", format: "a3", unit: "pt" });

    // ── Fonts (safe fallback if custom fonts are missing) ──────────────────────
    let fontName = "helvetica";
    if (pdfFonts && pdfFonts["arial.ttf"] && pdfFonts["arialbd.ttf"]) {
      doc.addFileToVFS("arial.ttf", pdfFonts["arial.ttf"]);
      doc.addFileToVFS("arialbd.ttf", pdfFonts["arialbd.ttf"]);
      doc.addFont("arial.ttf", "Arial", "normal");
      doc.addFont("arialbd.ttf", "Arial", "bold");
      fontName = "Arial";
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const usableWidth = pageWidth - margin * 2;

    // ── Same group colours as the Excel export ─────────────────────────────────
    const groupColor = (c) => {
      if (c <= 6) return "#0163D6";   // fixed columns
      if (c <= 12) return "#1D4ED8";  // DRDS
      if (c <= 18) return "#0F766E";  // DRTC
      if (c <= 23) return "#7C3AED";  // Admin & Allied
      return "#B45309";               // Others
    };

    // ── Title + subtitle ───────────────────────────────────────────────────────
    doc.setFont(fontName, "bold");
    doc.setFontSize(18);
    doc.setTextColor("#0163d6");
    doc.text("Annual Training Report", margin, margin + 16);

    doc.setFont(fontName, "normal");
    doc.setFontSize(9);
    doc.setTextColor("#64748b");

    const tableStartY = margin + 44;

    // ── Header ─────────────────────────────────────────────────────────────────
    const head = [
      [
        { content: "SN", rowSpan: 2 },
        { content: "Course Name", rowSpan: 2 },
        { content: "Within Lab (No.)", rowSpan: 2 },
        { content: "Other Labs (No.)", rowSpan: 2 },
        { content: "Outside (Within India)", rowSpan: 2 },
        { content: "Outside (Foreign Agency)", rowSpan: 2 },
        { content: "Sub Total", rowSpan: 2 },
        { content: "No. of Participants (DRDS)", colSpan: 6 },
        { content: "No. of Participants (DRTC)", colSpan: 6 },
        { content: "No. of Participants (Admin & Allied)", colSpan: 5 },
        { content: "No. of Participants (Others)", colSpan: 3 },
      ],
      [
        "TNI (No. & %)", "RAC Board Recomm.", "Open (No. & %)", "Total", "Male", "Female",
        "TNI (No. & %)", "CEPTAM Board Recomm.", "Open (No. & %)", "Total", "Male", "Female",
        "TNI (No. & %)", "Open (No. & %)", "Total", "Male", "Female",
        "Total", "Male", "Female",
      ],
    ];

    // ── Body: merge "GRAND TOTAL" across SN + Course Name ──────────────────────
    const lastIndex = rows.length - 1;
    const body = rows.map((row, i) =>
      i === lastIndex
        ? [{ content: "GRAND TOTAL", colSpan: 2, styles: { halign: "center" } }, ...row.slice(2)]
        : row
    );

    // ── Column widths: relative weights scaled to fill the page exactly ───────
    const weights = [
      28, 150, 42, 42, 50, 56, 40,        // fixed columns
      42, 52, 42, 38, 38, 38,             // DRDS
      42, 56, 42, 38, 38, 38,             // DRTC
      42, 42, 38, 38, 38,                 // Admin & Allied
      38, 38, 38,                         // Others
    ];
    const scale = usableWidth / weights.reduce((a, b) => a + b, 0);

    const columnStyles = {};
    for (let i = 0; i < COL_COUNT; i++) {
      columnStyles[i] = {
        cellWidth: weights[i] * scale,
        halign: i === 1 ? "left" : "center",
      };
    }

    autoTable(doc, {
      head,
      body,
      startY: tableStartY,
      margin: { top: margin, left: margin, right: margin, bottom: margin + 30 },
      tableWidth: usableWidth,
      columnStyles,
      theme: "grid",
      showHead: "everyPage",
      rowPageBreak: "avoid",

      styles: {
        font: fontName,
        fontSize: 7,
        cellPadding: 3,
        textColor: "#334155",
        lineColor: "#d9dee5",
        lineWidth: 0.5,
        overflow: "linebreak",
        valign: "middle",
        halign: "center",
      },

      headStyles: {
        textColor: "#ffffff",
        fontStyle: "bold",
        fontSize: 7,
        halign: "center",
        valign: "middle",
        lineColor: "#ffffff",
        cellPadding: 4,
      },

      alternateRowStyles: { fillColor: "#f8fafc" },

      didParseCell: (data) => {
        // Header: colour by column group
        if (data.section === "head") {
          data.cell.styles.fillColor = groupColor(data.column.index);
        }

        // Grand total row (body only, so header rows are never affected)
        if (data.section === "body" && data.row.index === lastIndex) {
          data.cell.styles.fillColor = "#FFF2CC";
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = "#000000";
          data.cell.styles.fontSize = data.column.index <= 1 ? 8 : 7;
        }

        // Course name stays left aligned (but not the header or the total label)
        if (data.section === "body" && data.column.index === 1 && data.row.index !== lastIndex) {
          data.cell.styles.halign = "left";
        }
      },
    });

    // ── Footer on every page (drawn after, so "of N" is correct) ───────────────
    const pageCount = doc.internal.getNumberOfPages();
    const generatedOn = `Generated on: ${getCurrentRegularDate()} ${new Date().toLocaleTimeString()}`;
    const footerY = pageHeight - margin + 10;

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor("#e2e8f0");
      doc.setLineWidth(0.5);
      doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

      doc.setFont(fontName, "normal");
      doc.setFontSize(8);
      doc.setTextColor("#808791");
      doc.text(generatedOn, margin, footerY + 4);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY + 4, { align: "right" });
    }

    doc.setProperties({
      title: "Annual Training Report",
      author: "HRMS",
    });

    const url = URL.createObjectURL(doc.output("blob"));
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000); // free memory after a minute
  };


  return (
    <div className="mt-4">
      <div className="card shadow">

        <div className={`d-flex align-items-center ${styles.gap2}`}>

          {/* EXPORT BUTTONS */}
          <div className={styles.exportWrapper}>
            <span className={styles.exportLabel}>EXPORT AS:</span>
            <div className={`btn-group ${styles.premiumBtnGroup}`}>
              <button className={`btn ${styles.exportBtn} ${styles.pdfBtn}`} onClick={() => handleExport('pdf')}>
                <FaRegFilePdf className={`${styles.exportIcon}`} />
                PDF
              </button>
              <button className={`btn ${styles.exportBtn} ${styles.excelBtn}`} onClick={() => handleExport('excel')}>
                <FaRegFileExcel className={`${styles.exportIcon}`} />
                Excel
              </button>
            </div>
          </div>
        </div>

        <div className={tabstyles.datatableContainer}>
          <table className={`${tabstyles.table} table table-bordered table-hover`}>
            <thead>
              {/* ================= FIRST HEADER ROW ================= */}
              <tr className="table-light">
                <th rowSpan="4">SN</th>
                <th rowSpan="4">Course name</th>
                <th rowSpan="4">Within Lab (No.)</th>
                <th rowSpan="4">Other Labs (No.)</th>
                <th rowSpan="4">Outside (Within India)</th>
                <th rowSpan="4">Outside (Foreign Agency)</th>
                <th rowSpan="4">Sub Total</th>

                <th colSpan="6">No. of Participants (DRDS)</th>
                <th colSpan="6">No. of Participants (DRTC)</th>
                <th colSpan="5">No. of Participants (Admin & Allied)</th>
                <th colSpan="3">No. of Participants (Others)</th>
              </tr>

              {/* ================= SECOND HEADER ROW ================= */}
              <tr className="table-secondary">

                <th rowSpan="3">TNI (No. & %)</th>
                <th rowSpan="3">RAC Board Recomm. (no & %) </th>
                <th rowSpan="3">Open (No. & %)</th>
                <th rowSpan="3">Total</th>
                <th rowSpan="3">Male</th>
                <th rowSpan="3">Female</th>

                <th rowSpan="3">TNI (No. & %)</th>
                <th rowSpan="3">CEPTAM Board Recomm. (no & %) </th>
                <th rowSpan="3">Open (No. & %)</th>
                <th rowSpan="3">Total</th>
                <th rowSpan="3">Male</th>
                <th rowSpan="3">Female</th>

                <th rowSpan="3">TNI (No. & %)</th>
                <th rowSpan="3">Open (No. & %)</th>
                <th rowSpan="3">Total</th>
                <th rowSpan="3">Male</th>
                <th rowSpan="3">Female</th>

                <th rowSpan="3">Total</th>
                <th rowSpan="3">Male</th>
                <th rowSpan="3">Female</th>
              </tr>

              <tr></tr>
              <tr></tr>
            </thead>

            <tbody>

              {reportData.length > 0 ? (
                <>
                  {reportData.map((row, index) => (
                    <tr key={index}>
                      <td className="text-center">{row.sn}</td>
                      <td>{row.course}</td>
                      <td className="text-center">{row.withinLab}</td>
                      <td className="text-center">{row.otherLabs}</td>
                      <td className="text-center">{row.outsideWithinIndia}</td>
                      <td className="text-center">{row.outsideForeignAgency}</td>
                      <td className="text-center">{row.subTotal}</td>

                      <td className="text-center">{row.drdsTni || 0}</td>
                      <td className="text-center">{row.drdsRacBoard || 0}</td>
                      <td className="text-center">{row.drdsOpen || 0}</td>
                      <td className="text-center">{row.drdsTotal || 0}</td>
                      <td className="text-center">{row.drdsMale || 0}</td>
                      <td className="text-center">{row.drdsFemale || 0}</td>

                      <td className="text-center">{row.drtcTni || 0}</td>
                      <td className="text-center">{row.drtcCeptamBoard || 0}</td>
                      <td className="text-center">{row.drtcOpen || 0}</td>
                      <td className="text-center">{row.drtcTotal || 0}</td>
                      <td className="text-center">{row.drtcMale || 0}</td>
                      <td className="text-center">{row.drtcFemale || 0}</td>

                      <td className="text-center">{row.adminAlliedTni || 0}</td>
                      <td className="text-center">{row.adminAlliedOpen || 0}</td>
                      <td className="text-center">{row.adminAlliedTotal || 0}</td>
                      <td className="text-center">{row.adminAlliedMale || 0}</td>
                      <td className="text-center">{row.adminAlliedFemale || 0}</td>

                      <td className="text-center">{row.othersTotal || 0}</td>
                      <td className="text-center">{row.othersMale || 0}</td>
                      <td className="text-center">{row.othersFemale || 0}</td>
                    </tr>
                  ))}

                  {/* ===== GRAND TOTAL ROW ===== */}
                  <tr className="table-warning fw-bold">
                    <td colSpan="2" className="text-center">GRAND TOTAL</td>
                    <td className="text-center">{totals.withinLab}</td>
                    <td className="text-center">{totals.otherLabs}</td>
                    <td className="text-center">{totals.outsideWithinIndia}</td>
                    <td className="text-center">{totals.outsideForeignAgency}</td>
                    <td className="text-center">{totals.subTotal}</td>

                    <td className="text-center">{totals.drdsTni}</td>
                    <td className="text-center">{totals.drdsRacBoard}</td>
                    <td className="text-center">{totals.drdsOpen}</td>
                    <td className="text-center">{totals.drdsTotal}</td>
                    <td className="text-center">{totals.drdsMale}</td>
                    <td className="text-center">{totals.drdsFemale}</td>

                    <td className="text-center">{totals.drtcTni}</td>
                    <td className="text-center">{totals.drtcCeptamBoard}</td>
                    <td className="text-center">{totals.drtcOpen}</td>
                    <td className="text-center">{totals.drtcTotal}</td>
                    <td className="text-center">{totals.drtcMale}</td>
                    <td className="text-center">{totals.drtcFemale}</td>

                    <td className="text-center">{totals.adminAlliedTni}</td>
                    <td className="text-center">{totals.adminAlliedOpen}</td>
                    <td className="text-center">{totals.adminAlliedTotal}</td>
                    <td className="text-center">{totals.adminAlliedMale}</td>
                    <td className="text-center">{totals.adminAlliedFemale}</td>

                    <td className="text-center">{totals.othersTotal}</td>
                    <td className="text-center">{totals.othersMale}</td>
                    <td className="text-center">{totals.othersFemale}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan="28" className="text-center">No data available</td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};

export default AnnualTrainingReportViewer;