
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealProbabilityWidgetProps {
    probability: number;
    disabled?: boolean;
    onChange?: (value: number) => void;
    label?: string;
    className?: string;
}

export const DealProbabilityWidget = ({ 
    probability, 
    disabled = false,
    onChange,
    label = "Win Probability",
    className
}: DealProbabilityWidgetProps) => {

    const [value, setValue] = useState(probability);

    useEffect(() => {
        setValue(probability);
    }, [probability]);

  // Get color based on probability
    const getColorClass = (prob: number) => {
        if (prob < 25) return "text-red-500";
        if (prob < 50) return "text-orange-500";
        if (prob < 75) return "text-yellow-500";
        return "text-green-500";
    };

    const handleChange = (newValue: number[]) => {
        const updatedValue = newValue[0];
        setValue(updatedValue);
        if (onChange) {
            onChange(updatedValue);
        }
    };

    return (
        <Card className={cn("w-full h-full", className)}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <BadgePercent className={cn("h-4 w-4", getColorClass(value))} />
                        <Label className="text-sm">{label}</Label>
                    </div>
                    <span className={cn("font-semibold text-lg", getColorClass(value))}>
                        {value}%
                    </span>
                </div>
                <Slider disabled={disabled} value={[value]} min={0} max={100} step={5} onValueChange={handleChange}
                    className={cn( "mt-2",  disabled ? "opacity-50 cursor-not-allowed" : "" )}
                />
            </CardContent>
        </Card>
    );
};
