
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { TDeals } from "@/types";

interface DealNotesWidgetProps {
    dealId: number;
    disabled?: boolean;
    handleSaveNote;
    dataDeal: TDeals[]
}

export const DealNotesWidget = ({ dealId, disabled = false, handleSaveNote, dataDeal }: DealNotesWidgetProps) => {
    const [note, setNote] = useState("");
    useEffect(() => {
        const currentDeal = dataDeal.find(d => Number(d.id) === Number(dealId));
        if (currentDeal) {
            setNote(currentDeal.notes || "");
        } else {
            setNote(""); 
        }
    }, [dealId, dataDeal]);

    return (
        <Card className="w-full">
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                    Deal Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add notes for this deal..."
                    className="min-h-[100px] text-sm"
                    disabled={disabled}
                />
                {!disabled && (
                    <Button onClick={() => handleSaveNote(dealId, note)} className="mt-3 w-full" size="sm">
                        Save Notes
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
