export function exportToCsv<T extends Record<string, any>>(filename: string, rows: T[]) {
  if (!rows || !rows.length) {
    return;
  }

  const separator = ',';
  const keys = Object.keys(rows[0]) as (keyof T)[];
  
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        const raw: unknown = row[k];
        const cell = raw === null || raw === undefined ? "" : raw;

        const text =
          cell instanceof Date ? cell.toLocaleString() : String(cell).replace(/"/g, '""');

        if (text.search(/("|,|\n)/g) >= 0) {
          return `"${text}"`;
        }

        return text;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportToPdf<T extends Record<string, any>>(filename: string, title: string, rows: T[]) {
  if (!rows || !rows.length) return;
  
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then(({ default: autoTable }) => {
      const doc = new jsPDF();
      
      const keys = Object.keys(rows[0]);
      const tableColumn = keys.map(k => k.toUpperCase());
      const tableRows = rows.map(r => keys.map(k => String(r[k])));

      doc.text(title, 14, 15);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 23, 42] } // primary dark slate
      });
      
      doc.save(`${filename}.pdf`);
    });
  });
}
