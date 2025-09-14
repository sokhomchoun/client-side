import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DealSkeletonProps {
  isActive: boolean;
}

export function DealSkeleton({ isActive }: DealSkeletonProps) {
    if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-20 flex flex-col p-6 overflow-y-auto bg-white dark:bg-[#051438] transition-colors">
            <div className="space-y-6 w-full">
                {/* Top Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl bg-gray-200 dark:bg-[#1F2C4D]"/>
                    ))}
                </div>

                {/* Deal Stages */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-100 dark:bg-[#1F2C4D]/40 space-y-4 animate-pulse transition-colors">
                        {/* Stage Title */}
                        <Skeleton className="h-6 w-1/4 bg-gray-200 dark:bg-[#1F2C4D]" />

                        {/* Example Deal Cards */}
                        {[...Array(2)].map((_, j) => (
                            <div key={j} className="p-3 rounded-lg bg-gray-50 dark:bg-[#1F2C4D]/30 space-y-3 transition-colors">
                                <Skeleton className="h-5 w-1/3 bg-gray-200 dark:bg-[#384361]" />
                                <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-[#384361]" />
                                <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-[#384361]" />
                                <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-[#384361]" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-[#384361]" />
                                    <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-[#384361]" />
                                </div>
                            </div>
                        ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
