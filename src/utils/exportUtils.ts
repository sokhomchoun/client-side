
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type Sale = {
  id: string;
  date: string;
  amount: number;
  product: string;
  category: string;
  customer: string;
  salesperson: string;
  cost: number;
  feedback: number;
  inventory: number;
  pipelineId: string;
};

export const exportToPDF = (
  sales: Sale[],
  periodName: string,
  totalSales: number,
  salesTarget: number,
  targetAchieved: number,
  selectedPipelineName?: string
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Sales Report', 20, 20);
  
  // Report details
  doc.setFontSize(12);
  doc.text(`Period: ${periodName}`, 20, 35);
  doc.text(`Pipeline: ${selectedPipelineName || 'All Pipelines'}`, 20, 45);
  doc.text(`Total Sales: $${totalSales.toLocaleString()}`, 20, 55);
  doc.text(`Target: $${salesTarget.toLocaleString()}`, 20, 65);
  doc.text(`Achievement: ${targetAchieved.toFixed(1)}%`, 20, 75);
  
  // Sales table
  const tableData = sales.map(sale => [
    sale.date,
    sale.product,
    sale.customer,
    sale.salesperson,
    `$${sale.amount.toLocaleString()}`,
    sale.category
  ]);
  
  autoTable(doc, {
    head: [['Date', 'Product', 'Customer', 'Salesperson', 'Amount', 'Category']],
    body: tableData,
    startY: 85,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  // Generate filename
  const filename = `sales-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Helper function to escape CSV values
const escapeCSVValue = (value: string | number): string => {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Helper function to convert array to CSV string
const arrayToCSV = (data: (string | number)[][]): string => {
  return data.map(row => 
    row.map(cell => escapeCSVValue(cell)).join(',')
  ).join('\n');
};

export const exportToCSV = (
  sales: Sale[],
  periodName: string,
  totalSales: number,
  salesTarget: number,
  targetAchieved: number,
  selectedPipelineName?: string
) => {
  // Prepare CSV data with report summary
  const csvData: (string | number)[][] = [
    ['Sales Report'],
    ['Period', periodName],
    ['Pipeline', selectedPipelineName || 'All Pipelines'],
    ['Total Sales', `$${totalSales.toLocaleString()}`],
    ['Target', `$${salesTarget.toLocaleString()}`],
    ['Achievement', `${targetAchieved.toFixed(1)}%`],
    [], // Empty row
    ['Date', 'Product', 'Customer', 'Salesperson', 'Amount', 'Category', 'Cost', 'Profit', 'Feedback', 'Inventory']
  ];
  
  // Add sales data
  sales.forEach(sale => {
    csvData.push([
      sale.date,
      sale.product,
      sale.customer,
      sale.salesperson,
      sale.amount,
      sale.category,
      sale.cost,
      sale.amount - sale.cost,
      sale.feedback,
      sale.inventory
    ]);
  });
  
  // Convert to CSV and download
  const csv = arrayToCSV(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
