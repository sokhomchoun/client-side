import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PipelineSkeletonProps {
  isActive: boolean;
}

export function PipelineSkeleton({ isActive }: PipelineSkeletonProps) {
    if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-10 flex flex-col p-6 bg-white dark:bg-[#051438] transition-colors">
            <div className="space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl bg-gray-200 dark:bg-[#1F2C4D]"/>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-100 dark:bg-[#1F2C4D]/40 space-y-3 animate-pulse transition-colors">
                            <Skeleton className="h-6 w-1/3 mb-4 bg-gray-200 dark:bg-[#384361]" />
                            <Skeleton className="h-10 w-full rounded-md bg-gray-200 dark:bg-[#384361]" />
                            <Skeleton className="h-10 w-full rounded-md bg-gray-200 dark:bg-[#384361]" />
                            <Skeleton className="h-10 w-full rounded-md bg-gray-200 dark:bg-[#384361]" />
                            <Skeleton className="h-10 w-full rounded-md bg-gray-200 dark:bg-[#384361]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
