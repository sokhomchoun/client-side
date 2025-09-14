import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Calendar, ArrowUpRight, ArrowDownRight, ChartBar, Users, BarChart2, ChevronDown, ChevronUp, PieChart, LineChart, AreaChartIcon, Grid3X3, TrendingUp, DollarSign, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Legend, Line, LineChart as RechartsLineChart, Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart as RechartsPieChart, Pie as RechartsPie, CartesianGrid, Area, AreaChart as RechartsAreaChart } from "recharts";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalesTarget, Pipeline } from "../types/pipeline";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ExportDropdown from "@/components/ExportDropdown";

// Types for the sales data
type Sale = {
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
type SalesMetric = {
  name: string;
  value: number;
};

// Period type for date range selection
type PeriodType = "custom" | "monthly" | "quarterly" | "yearly";

// Update the DateRange type to match react-day-picker's DateRange type
interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

// View types for data visualization - removing table
type ViewType = "bar" | "line" | "area" | "pie";
const COLORS = [
  '#6366F1', // Modern indigo
  '#10B981', // Emerald green  
  '#F59E0B', // Amber orange
  '#EF4444', // Modern red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime green
  '#F97316', // Orange
  '#EC4899', // Pink
  '#64748B'  // Slate gray
];

const Sales = () => {
  // Sample pipelines data with sales targets
  const [pipelines] = useState<Pipeline[]>([{
    id: "default",
    name: "Sales Pipeline",
    description: "Default sales pipeline for tracking deals",
    lastUpdated: "2025-05-19T12:30:00Z",
    dealCount: 5,
    stages: [{
      id: "lead",
      name: "Lead",
      color: "bg-blue-500"
    }, {
      id: "won",
      name: "Won",
      color: "bg-green-500"
    }],
    salesTarget: {
      monthly: 10000,
      quarterly: 30000,
      yearly: 120000,
      periodType: "monthly"
    }
  }, {
    id: "support",
    name: "Support Pipeline",
    description: "Track customer support tickets",
    lastUpdated: "2025-05-18T09:15:00Z",
    dealCount: 3,
    stages: [{
      id: "new",
      name: "New Ticket",
      color: "bg-blue-500"
    }, {
      id: "resolved",
      name: "Resolved",
      color: "bg-green-500"
    }],
    salesTarget: {
      monthly: 5000,
      quarterly: 15000,
      yearly: 60000,
      periodType: "quarterly"
    }
  }, {
    id: "marketing",
    name: "Marketing Pipeline",
    description: "Track marketing campaigns and leads",
    lastUpdated: "2025-05-20T10:25:00Z",
    dealCount: 2,
    stages: [{
      id: "lead",
      name: "Lead",
      color: "bg-blue-500"
    }, {
      id: "qualified",
      name: "Qualified",
      color: "bg-green-500"
    }],
    salesTarget: {
      monthly: 8000,
      quarterly: 24000,
      yearly: 96000,
      periodType: "yearly"
    }
  }]);

  // Sample sales data - now with pipelineId
  const [sales] = useState<Sale[]>([{
    id: "1",
    date: "2025-05-01",
    amount: 1200,
    product: "Software License",
    category: "Software",
    customer: "John Doe",
    salesperson: "Sarah Johnson",
    cost: 500,
    feedback: 4.5,
    inventory: 25,
    pipelineId: "default"
  }, {
    id: "2",
    date: "2025-05-10",
    amount: 3500,
    product: "Hardware Bundle",
    category: "Hardware",
    customer: "Acme Corp",
    salesperson: "Mike Stevens",
    cost: 2200,
    feedback: 5,
    inventory: 15,
    pipelineId: "default"
  }, {
    id: "3",
    date: "2025-05-15",
    amount: 750,
    product: "Support Plan",
    category: "Services",
    customer: "Jane Smith",
    salesperson: "Sarah Johnson",
    cost: 300,
    feedback: 4,
    inventory: 50,
    pipelineId: "support"
  }, {
    id: "4",
    date: "2025-05-20",
    amount: 2100,
    product: "Software License",
    category: "Software",
    customer: "Zenith Inc",
    salesperson: "Robert Chen",
    cost: 500,
    feedback: 4.8,
    inventory: 22,
    pipelineId: "default"
  }, {
    id: "5",
    date: "2025-05-22",
    amount: 1800,
    product: "Consulting Services",
    category: "Services",
    customer: "Tech Solutions",
    salesperson: "Lisa Morgan",
    cost: 1000,
    feedback: 4.2,
    inventory: 0,
    pipelineId: "marketing"
  }, {
    id: "6",
    date: "2025-06-05",
    amount: 4000,
    product: "Software License",
    category: "Software",
    customer: "Global Corp",
    salesperson: "Mike Stevens",
    cost: 1500,
    feedback: 4.7,
    inventory: 18,
    pipelineId: "default"
  }, {
    id: "7",
    date: "2025-06-12",
    amount: 5200,
    product: "Hardware Bundle",
    category: "Hardware",
    customer: "Acme Corp",
    salesperson: "Sarah Johnson",
    cost: 3000,
    feedback: 4.9,
    inventory: 10,
    pipelineId: "default"
  }, {
    id: "8",
    date: "2025-06-18",
    amount: 3200,
    product: "Consulting Services",
    category: "Services",
    customer: "Tech Solutions",
    salesperson: "Lisa Morgan",
    cost: 1800,
    feedback: 4.5,
    inventory: 0,
    pipelineId: "marketing"
  }]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [visualizationType, setVisualizationType] = useState<ViewType>("bar");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date("2025-05-01"),
    to: new Date("2025-06-30")
  });
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("all");
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const isMobile = useIsMobile();
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

  // Get the appropriate target value based on the selected period type
  const getTargetForPeriod = (salesTarget: SalesTarget | number | undefined): number => {
    if (!salesTarget) return 0;
    if (typeof salesTarget === 'number') return salesTarget;
    if (periodType === 'yearly') return salesTarget.yearly || 0;
    if (periodType === 'quarterly') return salesTarget.quarterly || 0;
    return salesTarget.monthly || 0;
  };

  // Filter sales based on search term, date range, and selected pipeline
  const filteredSales = sales.filter(sale => {
    // Text search filter
    const matchesSearch = sale.product.toLowerCase().includes(searchTerm.toLowerCase()) || sale.customer.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    const saleDate = new Date(sale.date);
    const matchesDateFrom = dateRange.from ? saleDate >= dateRange.from : true;
    const matchesDateTo = dateRange.to ? saleDate <= dateRange.to : true;

    // Pipeline filter
    const matchesPipeline = selectedPipelineId === "all" || sale.pipelineId === selectedPipelineId;
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesPipeline;
  });

  // Get sales target for selected pipeline or sum of all targets
  const salesTarget = selectedPipelineId !== "all" ? pipelines.find(p => p.id === selectedPipelineId)?.salesTarget : pipelines.reduce((sum, pipeline) => {
    return sum + getTargetForPeriod(pipeline.salesTarget);
  }, 0);

  // Calculate total sales
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalCosts = filteredSales.reduce((sum, sale) => sum + sale.cost, 0);
  const totalProfit = totalSales - totalCosts;

  // Calculate percentage of target achieved
  const targetAchieved = salesTarget ? typeof salesTarget === 'object' ? totalSales / getTargetForPeriod(salesTarget) * 100 : totalSales / salesTarget * 100 : 0;

  // Get the appropriate period name based on the date range
  const getPeriodName = (): string => {
    if (!dateRange.from) return "Custom Period";
    const from = dateRange.from;
    const to = dateRange.to || from;

    // Check if the range matches a month
    if (from.getDate() === 1 && to.getDate() === new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate() && from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      return `Monthly (${format(from, 'MMM yyyy')})`;
    }

    // Check if the range matches a quarter
    const quarterStart = startOfQuarter(from);
    const quarterEnd = endOfQuarter(from);
    if (from.getTime() === quarterStart.getTime() && to.getTime() === quarterEnd.getTime()) {
      return `Quarterly (Q${Math.floor(from.getMonth() / 3) + 1} ${from.getFullYear()})`;
    }

    // Check if the range matches a year
    const yearStart = startOfYear(from);
    const yearEnd = endOfYear(from);
    if (from.getTime() === yearStart.getTime() && to.getTime() === yearEnd.getTime()) {
      return `Yearly (${from.getFullYear()})`;
    }

    // Default to custom range
    return `${format(from, 'MMM dd, yyyy')} - ${format(to, 'MMM dd, yyyy')}`;
  };

  // Auto-set period type based on date range
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    if (!newDateRange || !newDateRange.from) {
      setDateRange({
        from: undefined
      });
      setPeriodType('custom');
      return;
    }
    setDateRange(newDateRange);
    const from = newDateRange.from;
    const to = newDateRange.to || from;

    // Determine period type based on the date range
    if (from.getDate() === 1 && to.getDate() === new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate() && from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      setPeriodType('monthly');
    } else if (from.getTime() === startOfQuarter(from).getTime() && to.getTime() === endOfQuarter(from).getTime()) {
      setPeriodType('quarterly');
    } else if (from.getTime() === startOfYear(from).getTime() && to.getTime() === endOfYear(from).getTime()) {
      setPeriodType('yearly');
    } else {
      setPeriodType('custom');
    }
  };

  // Set predefined periods
  const setCurrentMonth = () => {
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now);
    const lastDayOfMonth = endOfMonth(now);
    handleDateRangeChange({
      from: firstDayOfMonth,
      to: lastDayOfMonth
    });
  };
  const setCurrentQuarter = () => {
    const now = new Date();
    const firstDayOfQuarter = startOfQuarter(now);
    const lastDayOfQuarter = endOfQuarter(now);
    handleDateRangeChange({
      from: firstDayOfQuarter,
      to: lastDayOfQuarter
    });
  };
  const setCurrentYear = () => {
    const now = new Date();
    const firstDayOfYear = startOfYear(now);
    const lastDayOfYear = endOfYear(now);
    handleDateRangeChange({
      from: firstDayOfYear,
      to: lastDayOfYear
    });
  };

  // Sales by product
  const salesByProduct = filteredSales.reduce((acc: SalesMetric[], sale) => {
    const existingProduct = acc.find(product => product.name === sale.product);
    if (existingProduct) {
      existingProduct.value += sale.amount;
    } else {
      acc.push({
        name: sale.product,
        value: sale.amount
      });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  // Sales by customer (top clients)
  const salesByCustomer = filteredSales.reduce((acc: SalesMetric[], sale) => {
    const existingCustomer = acc.find(customer => customer.name === sale.customer);
    if (existingCustomer) {
      existingCustomer.value += sale.amount;
    } else {
      acc.push({
        name: sale.customer,
        value: sale.amount
      });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  // Top 5 customers
  const topCustomers = salesByCustomer.slice(0, 5);

  // Sales by category
  const salesByCategory = filteredSales.reduce((acc: SalesMetric[], sale) => {
    const existingCategory = acc.find(category => category.name === sale.category);
    if (existingCategory) {
      existingCategory.value += sale.amount;
    } else {
      acc.push({
        name: sale.category,
        value: sale.amount
      });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  // Monthly sales trend
  const monthlySales = filteredSales.reduce((acc: {
    [key: string]: number;
  }, sale) => {
    const month = format(new Date(sale.date), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + sale.amount;
    return acc;
  }, {});
  const monthlySalesData = Object.entries(monthlySales).map(([month, amount]) => ({
    month,
    amount
  }));

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Clear date range filter
  const clearDateRange = () => {
    setDateRange({
      from: undefined,
      to: undefined
    });
    setPeriodType('custom');
  };

  // Render visualization based on selected type
  const renderVisualization = (data: SalesMetric[], title: string) => {
    switch (visualizationType) {
      case "bar":
        return <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{
              fontSize: 12
            }} />
              <YAxis />
              <Tooltip formatter={value => [formatCurrency(Number(value)), 'Revenue']} />
              <Bar dataKey="value" fill="rgba(99, 102, 241, 0.5)" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>;
      case "line":
        return <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={monthlySalesData} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{
              fontSize: 12
            }} />
              <YAxis />
              <Tooltip formatter={value => [formatCurrency(Number(value)), 'Revenue']} />
              <Line type="monotone" dataKey="amount" stroke="rgba(99, 102, 241, 0.5)" strokeWidth={3} dot={{
              fill: 'rgba(99, 102, 241, 0.5)',
              strokeWidth: 2,
              r: 6
            }} />
            </RechartsLineChart>
          </ResponsiveContainer>;
      case "area":
        return <ResponsiveContainer width="100%" height={400}>
            <RechartsAreaChart data={monthlySalesData} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{
              fontSize: 12
            }} />
              <YAxis />
              <Tooltip formatter={value => [formatCurrency(Number(value)), 'Revenue']} />
              <Area type="monotone" dataKey="amount" stroke="rgba(99, 102, 241, 0.5)" fill="url(#colorGradient)" fillOpacity={0.3} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(99, 102, 241, 0.4)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="rgba(99, 102, 241, 0.5)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
            </RechartsAreaChart>
          </ResponsiveContainer>;
      case "pie":
        return <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <RechartsPie data={data.slice(0, 6)} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" label={({
              name,
              percent
            }) => `${name} ${(percent * 100).toFixed(0)}%`} fillOpacity={0.5}>
                {data.slice(0, 6).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </RechartsPie>
              <Tooltip formatter={value => [formatCurrency(Number(value)), 'Revenue']} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>;
      default:
        return null;
    }
  };

  // Calculate monthly breakdown data
  const getMonthlyBreakdown = () => {
    const monthlyData: { [key: string]: { sales: number; deals: number; profit: number; target: number } } = {};
    
    filteredSales.forEach(sale => {
      const monthKey = format(new Date(sale.date), 'MMM yyyy');
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sales: 0, deals: 0, profit: 0, target: 0 };
      }
      monthlyData[monthKey].sales += sale.amount;
      monthlyData[monthKey].deals += 1;
      monthlyData[monthKey].profit += (sale.amount - sale.cost);
    });

    // Add targets for each month
    Object.keys(monthlyData).forEach(monthKey => {
      if (selectedPipelineId !== "all") {
        const pipeline = pipelines.find(p => p.id === selectedPipelineId);
        monthlyData[monthKey].target = getTargetForPeriod(pipeline?.salesTarget);
      } else {
        monthlyData[monthKey].target = pipelines.reduce((sum, pipeline) => {
          return sum + getTargetForPeriod(pipeline.salesTarget);
        }, 0);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  return <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Analytics</h1>
            
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Pipeline selector */}
            <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Select pipeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pipelines</SelectItem>
                <SelectGroup>
                  <SelectLabel>Your Pipelines</SelectLabel>
                  {pipelines.map(pipeline => <SelectItem key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Date range picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`flex items-center gap-2 ${!dateRange.from && "text-muted-foreground"}`}>
                  <Calendar className="h-4 w-4" />
                  {dateRange.from ? getPeriodName() : <span>Date Range</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex flex-col space-y-2 p-2">
                  <CalendarComponent mode="range" selected={dateRange} onSelect={handleDateRangeChange} numberOfMonths={isMobile ? 1 : 2} initialFocus />
                  <div className="flex flex-wrap justify-between gap-2 border-t pt-2">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={setCurrentMonth}>Month</Button>
                      <Button variant="outline" size="sm" onClick={setCurrentQuarter}>Quarter</Button>
                      <Button variant="outline" size="sm" onClick={setCurrentYear}>Year</Button>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={clearDateRange}>Clear</Button>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Export dropdown */}
            <ExportDropdown sales={filteredSales} periodName={getPeriodName()} totalSales={totalSales} salesTarget={selectedPipelineId !== "all" ? typeof salesTarget === 'object' && salesTarget !== null ? getTargetForPeriod(salesTarget) : typeof salesTarget === 'number' ? salesTarget : 0 : typeof salesTarget === 'number' ? salesTarget : 0} targetAchieved={targetAchieved} selectedPipelineName={selectedPipelineId !== "all" ? pipelines.find(p => p.id === selectedPipelineId)?.name : undefined} />
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-2 border-transparent bg-gradient-to-br from-red-50/40 to-red-100/40 dark:from-red-950/10 dark:to-red-900/10 hover:border-red-200/50 dark:hover:border-red-800/50 transition-all duration-200 backdrop-blur-sm">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{formatCurrency(totalSales)}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{getPeriodName()}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-transparent bg-gradient-to-br from-green-50/40 to-green-100/40 dark:from-green-950/10 dark:to-green-900/10 hover:border-green-200/50 dark:hover:border-green-800/50 transition-all duration-200 backdrop-blur-sm">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Profit</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(totalProfit)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {totalSales > 0 ? `${(totalProfit / totalSales * 100).toFixed(1)}% margin` : 'No sales'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-transparent bg-gradient-to-br from-cyan-50/40 to-cyan-100/40 dark:from-cyan-950/10 dark:to-cyan-900/10 hover:border-cyan-200/50 dark:hover:border-cyan-800/50 transition-all duration-200 backdrop-blur-sm">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Target</CardTitle>
              <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
              {formatCurrency(selectedPipelineId !== "all" ? typeof salesTarget === 'object' && salesTarget !== null ? getTargetForPeriod(salesTarget) : typeof salesTarget === 'number' ? salesTarget : 0 : typeof salesTarget === 'number' ? salesTarget : 0)}
            </p>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
              {selectedPipelineId !== "all" ? pipelines.find(p => p.id === selectedPipelineId)?.name : "All Pipelines"}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 border-transparent transition-all duration-200 backdrop-blur-sm ${targetAchieved >= 100 ? "bg-gradient-to-br from-green-50/40 to-green-100/40 dark:from-green-950/10 dark:to-green-900/10 hover:border-green-200/50 dark:hover:border-green-800/50" : "bg-gradient-to-br from-yellow-50/40 to-yellow-100/40 dark:from-yellow-950/10 dark:to-yellow-900/10 hover:border-yellow-200/50 dark:hover:border-yellow-800/50"}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${targetAchieved >= 100 ? "text-green-700 dark:text-green-300" : "text-yellow-700 dark:text-yellow-300"}`}>Achievement</CardTitle>
              {targetAchieved >= 100 ? <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" /> : <ArrowDownRight className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className={`text-2xl font-bold ${targetAchieved >= 100 ? "text-green-900 dark:text-green-100" : "text-yellow-900 dark:text-yellow-100"}`}>{targetAchieved.toFixed(1)}%</p>
            <div className={`w-full rounded-full h-2 mt-2 ${targetAchieved >= 100 ? "bg-green-200/50 dark:bg-green-800/20" : "bg-yellow-200/50 dark:bg-yellow-800/20"}`}>
              <div className={`h-2 rounded-full transition-all duration-300 ${targetAchieved >= 100 ? "bg-green-500" : "bg-yellow-500"}`} style={{
              width: `${Math.min(targetAchieved, 100)}%`
            }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeView} onValueChange={setActiveView}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ChartBar className="h-4 w-4" /> Product
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Customers
            </TabsTrigger>
            <TabsTrigger value="targets" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" /> Targets
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            
            
            {/* Visualization Type Selector */}
            <Select value={visualizationType} onValueChange={(value: ViewType) => setVisualizationType(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    <span>Bar Chart</span>
                  </div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    <span>Line Chart</span>
                  </div>
                </SelectItem>
                <SelectItem value="area">
                  <div className="flex items-center gap-2">
                    <AreaChartIcon className="h-4 w-4" />
                    <span>Area Chart</span>
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    <span>Pie Chart</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Product Performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Performance</CardTitle>
                    <CardDescription>Revenue by product for {getPeriodName()}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>View:</span>
                    {visualizationType === "bar" && <BarChart2 className="h-4 w-4" />}
                    {visualizationType === "line" && <LineChart className="h-4 w-4" />}
                    {visualizationType === "area" && <AreaChartIcon className="h-4 w-4" />}
                    {visualizationType === "pie" && <PieChart className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderVisualization(salesByProduct, "Product Performance")}
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Revenue by category for {getPeriodName()}</CardDescription>
              </CardHeader>
              <CardContent>
                {renderVisualization(salesByCategory, "Category Performance")}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Details</CardTitle>
              <CardDescription>Complete sales transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Salesperson</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map(sale => <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="font-medium">{sale.product}</TableCell>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell>{sale.salesperson}</TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.amount)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(sale.amount - sale.cost)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {sale.category}
                          </span>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Revenue by customer for {getPeriodName()}</CardDescription>
              </CardHeader>
              <CardContent>
                {renderVisualization(topCustomers, "Top Customers")}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Analysis</CardTitle>
                <CardDescription>Detailed customer performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Avg Order</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesByCustomer.map(customer => {
                      const customerSales = filteredSales.filter(sale => sale.customer === customer.name);
                      const orderCount = customerSales.length;
                      const avgOrder = orderCount > 0 ? customer.value / orderCount : 0;
                      return <TableRow key={customer.name}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(customer.value)}</TableCell>
                            <TableCell className="text-right">{orderCount}</TableCell>
                            <TableCell className="text-right">{formatCurrency(avgOrder)}</TableCell>
                          </TableRow>;
                    })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Targets Tab */}
        <TabsContent value="targets" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Sales Target Analysis</CardTitle>
              <CardDescription>Performance against sales targets by pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pipeline</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                      <TableHead className="text-right">Achievement</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pipelines.map(pipeline => {
                    const pipelineSales = filteredSales.filter(sale => sale.pipelineId === pipeline.id).reduce((sum, sale) => sum + sale.amount, 0);
                    const targetValue = getTargetForPeriod(pipeline.salesTarget);
                    const difference = pipelineSales - targetValue;
                    const achievement = targetValue > 0 ? pipelineSales / targetValue * 100 : 0;
                    return <TableRow key={pipeline.id}>
                          <TableCell className="font-medium">{pipeline.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(targetValue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(pipelineSales)}</TableCell>
                          <TableCell className={`text-right font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${achievement >= 100 ? 'text-green-600' : achievement >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {achievement.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${achievement >= 100 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : achievement >= 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                              {achievement >= 100 ? <>
                                  <ArrowUpRight className="h-3 w-3" />
                                  Exceeded
                                </> : achievement >= 80 ? <>
                                  <ArrowUpRight className="h-3 w-3" />
                                  On Track
                                </> : <>
                                  <ArrowDownRight className="h-3 w-3" />
                                  Behind
                                </>}
                            </div>
                          </TableCell>
                        </TableRow>;
                  })}
                  </TableBody>
                </Table>
              </div>

              {/* Monthly Breakdown - Updated */}
              <Collapsible open={isDetailExpanded} onOpenChange={setIsDetailExpanded} className="mt-6">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 w-full justify-center"
                    onClick={() => setIsDetailExpanded(!isDetailExpanded)}
                  >
                    {isDetailExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Monthly Breakdown
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show Monthly Breakdown
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">Target</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                          <TableHead className="text-right">Deals</TableHead>
                          <TableHead className="text-right">Avg Deal</TableHead>
                          <TableHead className="text-right">Achievement</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getMonthlyBreakdown().map(monthData => {
                          const achievement = monthData.target > 0 ? (monthData.sales / monthData.target) * 100 : 0;
                          const avgDeal = monthData.deals > 0 ? monthData.sales / monthData.deals : 0;
                          
                          return (
                            <TableRow key={monthData.month}>
                              <TableCell className="font-medium">{monthData.month}</TableCell>
                              <TableCell className="text-right">{formatCurrency(monthData.sales)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(monthData.target)}</TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                {formatCurrency(monthData.profit)}
                              </TableCell>
                              <TableCell className="text-right">{monthData.deals}</TableCell>
                              <TableCell className="text-right">{formatCurrency(avgDeal)}</TableCell>
                              <TableCell className={`text-right font-medium ${achievement >= 100 ? 'text-green-600' : achievement >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {achievement.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Sales;
