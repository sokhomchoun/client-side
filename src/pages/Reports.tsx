
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

type StageData = {
  name: string;
  value: number;
  count: number;
}

type TimelineData = {
  month: string;
  deals: number;
  revenue: number;
}

type SourceData = {
  name: string;
  value: number;
}

const Reports = () => {
  // Sample data for pipeline by stage
  const pipelineByStage: StageData[] = [
    { name: "Lead", value: 25000, count: 5 },
    { name: "Meeting", value: 40000, count: 4 },
    { name: "Proposal", value: 55000, count: 3 },
    { name: "Negotiation", value: 70000, count: 2 },
    { name: "Won", value: 35000, count: 3 }
  ];
  
  // Sample timeline data
  const timelineData: TimelineData[] = [
    { month: "Jan", deals: 6, revenue: 45000 },
    { month: "Feb", deals: 8, revenue: 65000 },
    { month: "Mar", deals: 10, revenue: 80000 },
    { month: "Apr", deals: 12, revenue: 95000 },
    { month: "May", deals: 9, revenue: 75000 }
  ];
  
  // Sample lead sources data
  const leadSources: SourceData[] = [
    { name: "Website", value: 35 },
    { name: "Referral", value: 25 },
    { name: "Social Media", value: 15 },
    { name: "Email", value: 15 },
    { name: "Other", value: 10 }
  ];
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Calculate key metrics
  const totalDeals = pipelineByStage.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = pipelineByStage.reduce((sum, stage) => sum + stage.value, 0);
  const wonDeals = pipelineByStage.find(s => s.name === "Won")?.count || 0;
  const wonValue = pipelineByStage.find(s => s.name === "Won")?.value || 0;
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalDeals}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Won Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{wonDeals}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Won Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${wonValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="pipeline">
        <TabsList className="mb-6">
          <TabsTrigger value="pipeline">Pipeline by Stage</TabsTrigger>
          <TabsTrigger value="timeline">Sales Timeline</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Value by Stage</CardTitle>
              <CardDescription>
                Distribution of deal value across sales pipeline stages
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer 
                config={{
                  lead: { theme: { light: "#0088FE", dark: "#0088FE" } },
                  meeting: { theme: { light: "#00C49F", dark: "#00C49F" } },
                  proposal: { theme: { light: "#FFBB28", dark: "#FFBB28" } },
                  negotiation: { theme: { light: "#FF8042", dark: "#FF8042" } },
                  won: { theme: { light: "#8884d8", dark: "#8884d8" } },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineByStage}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />} 
                    />
                    <Bar dataKey="value" fill="var(--color-lead)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Sales Timeline</CardTitle>
              <CardDescription>
                Monthly trend of deals closed and revenue generated
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer 
                config={{
                  deals: { theme: { light: "#0088FE", dark: "#0088FE" } },
                  revenue: { theme: { light: "#00C49F", dark: "#00C49F" } },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip 
                      content={<ChartTooltipContent />} 
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="deals" 
                      stroke="var(--color-deals)" 
                      name="Deals Closed"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-revenue)" 
                      name="Revenue ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>
                Distribution of leads by acquisition channel
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leadSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
