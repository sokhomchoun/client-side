
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { exportToPDF, exportToCSV, Sale } from "@/utils/exportUtils";

interface ExportDropdownProps {
  sales: Sale[];
  periodName: string;
  totalSales: number;
  salesTarget: number;
  targetAchieved: number;
  selectedPipelineName?: string;
}

const ExportDropdown = ({
  sales,
  periodName,
  totalSales,
  salesTarget,
  targetAchieved,
  selectedPipelineName
}: ExportDropdownProps) => {
  const handlePDFExport = () => {
    exportToPDF(sales, periodName, totalSales, salesTarget, targetAchieved, selectedPipelineName);
  };

  const handleCSVExport = () => {
    exportToCSV(sales, periodName, totalSales, salesTarget, targetAchieved, selectedPipelineName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePDFExport} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCSVExport} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropdown;
