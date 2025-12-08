export const exportToCSV = (data, columns, filename) => {
  return new Promise((resolve) => {
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.key];
        // Handle values that might contain commas
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    downloadFile(csv, `${filename}.csv`, 'text/csv');
    resolve();
  });
};

export const exportToExcel = (data, columns, filename) => {
  return new Promise((resolve) => {
    // In a real app, you would use a library like xlsx
    // This is a simplified version that exports as CSV with .xlsx extension
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.key];
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    downloadFile(csv, `${filename}.xlsx`, 'application/vnd.ms-excel');
    resolve();
  });
};

export const exportToJSON = (data, filename) => {
  return new Promise((resolve) => {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${filename}.json`, 'application/json');
    resolve();
  });
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};