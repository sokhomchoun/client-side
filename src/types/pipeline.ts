export type SalesTarget = {
    monthly: number;
    quarterly: number;
    yearly: number;
    periodType: "monthly" | "quarterly" | "yearly";
};

export type Pipeline = {
    id: number;
    name: string;
    description?: string;
    lastUpdated: string;
    dealCount: number;
    stages: any[];
    salesTarget: SalesTarget;
};
