import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { TBoardColumn } from "@/types/task";
import { useTask } from "@/hooks/useTask";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface BoardColumnsManagerProps {
  boardColumns: TBoardColumn[];
  onUpdateColumns: (columns: TBoardColumn[]) => void;
  // Optional handlers provided by parent to perform API operations and refresh state
  onCreateColumn?: (column: { name: string; color: string }) => Promise<any>;
  onUpdateColumn?: (column: {
    id: number;
    name: string;
    color: string;
  }) => Promise<any>;
  onDeleteColumn?: (id: number) => Promise<any>;
  onUpdateColumnPosition?: (id: number, position: number) => Promise<any>;
}

export const BoardColumnsManager: React.FC<BoardColumnsManagerProps> = ({
  boardColumns,
  onUpdateColumns,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onUpdateColumnPosition,
}) => {
  const {
    // Fallbacks if parent handlers are not provided
    handleCreateBoardColumn,
    handleUpdateBoardColumn,
    handleDeleteBoardColumn,
    handleUpdateBoardColumnPosition,
    handleGetBoardColumns,
  } = useTask();

  const [isOpen, setIsOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<TBoardColumn | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("#E84f44");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [columnIdToDelete, setColumnIdToDelete] = useState<number | null>(null);

  // Sync hook state changes back to parent when API operations complete
  useEffect(() => {
    if (boardColumns && boardColumns.length > 0) {
      onUpdateColumns(boardColumns);
    }
  }, [boardColumns]);

  // If parent didn't preload columns and user opens manager, fetch once
  useEffect(() => {
    if (!boardColumns || boardColumns.length === 0) {
      handleGetBoardColumns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      toast.error("Column name cannot be empty.");
      return;
    }

    const newColumn = {
      name: newColumnName.trim(),
      color: newColumnColor,
    };

    // Prefer parent-provided handler; fallback to hook
    const rep = await (onCreateColumn
      ? onCreateColumn(newColumn)
      : handleCreateBoardColumn(newColumn));
    if (rep && rep.status === 201) {
      setNewColumnName("");
      setNewColumnColor("#E84f44");
    }
  };

  // (open edit form)
  const handleEditColumn = (column: TBoardColumn) => {
    setEditingColumn(column);
    setNewColumnName(column.name);
    setNewColumnColor(column.color);
  };

  const handleUpdateColumn = async () => {
    if (!editingColumn || !newColumnName.trim()) return;

    const updatedColumn = {
      id: editingColumn.id,
      name: newColumnName.trim(),
      color: newColumnColor,
    };

    // Prefer parent-provided handler; fallback to hook
    await (onUpdateColumn
      ? onUpdateColumn(updatedColumn)
      : handleUpdateBoardColumn(updatedColumn)); // API call

    setEditingColumn(null);
    setNewColumnName("");
    setNewColumnColor("#E84f44");
  };

  const handleDeleteColumn = async (Id: number) => {
    setColumnIdToDelete(Id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (columnIdToDelete === null) return;

    // Prefer parent-provided handler; fallback to hook
    await (onDeleteColumn
      ? onDeleteColumn(columnIdToDelete)
      : handleDeleteBoardColumn(columnIdToDelete));

    setDeleteConfirmOpen(false);
    setColumnIdToDelete(null);
  };

  // Reordering still handled locally
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newColumns = [...boardColumns];
    const [draggedColumn] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);

    // Ask parent to update its local state immediately
    onUpdateColumns(newColumns);
    setDraggedIndex(null);

    for (let i = 0; i < newColumns.length; i++) {
      const column = newColumns[i];
      // Prefer parent-provided handler; fallback to hook
      await (onUpdateColumnPosition
        ? onUpdateColumnPosition(column.id, i + 1)
        : handleUpdateBoardColumnPosition(column.id, i + 1));
    }
    toast.success("Board columns updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingColumn(null);
    setNewColumnName("");
    setNewColumnColor("#E84f44");
  };

  const predefinedColors = [
    "#E84f44",
    "#FA791A",
    "#F8DA35",
    "#6FAF6B",
    "#1A631A",
    "#1ABCC3",
    "#FB6668",
    "#1F2C4D",
    "#ec4899",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Manage Columns
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Kanban Columns</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add/Edit Column Form */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label>
                  {editingColumn ? "Edit Column" : "Add New Column"}
                </Label>
                <Input
                  placeholder="Column name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                />
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full border-2 ${
                          newColumnColor === color
                            ? "border-gray-800"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewColumnColor(color)}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={newColumnColor}
                    onChange={(e) => setNewColumnColor(e.target.value)}
                    className="w-full h-8"
                  />
                </div>
                <div className="flex gap-2">
                  {editingColumn ? (
                    <>
                      <Button onClick={handleUpdateColumn} size="sm">
                        Update Column
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleAddColumn} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Column
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Columns */}
          <div className="space-y-2">
            <Label>Existing Columns (drag to reorder)</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {boardColumns.map((column, index) => (
                <div
                  key={column.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="flex items-center justify-between p-3 border rounded-md bg-card cursor-move hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <span className="font-medium">{column.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditColumn(column)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteColumn(column.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Delete Board Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setColumnIdToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              column and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
