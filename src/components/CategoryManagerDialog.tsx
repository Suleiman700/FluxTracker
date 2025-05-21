
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Edit2, Trash2, PlusCircle, Save, Tag } from "lucide-react";
import type { Category } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string) => Promise<void>;
  onUpdateCategory: (id: string, newName: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function CategoryManagerDialog({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerDialogProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (editingCategory) {
      setEditName(editingCategory.name);
    } else {
      setEditName("");
    }
  }, [editingCategory]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      await onAddCategory(newCategoryName.trim());
      setNewCategoryName("");
      toast({ title: "Success", description: "Category added." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add category.", variant: "destructive" });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editName.trim()) {
       toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      await onUpdateCategory(editingCategory.id, editName.trim());
      setEditingCategory(null);
      toast({ title: "Success", description: "Category updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update category.", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    // Simple confirmation, can be enhanced with AlertDialog
    if (!window.confirm("Are you sure you want to delete this category? Payments using it will be uncategorized.")) return;
    try {
      await onDeleteCategory(id);
      toast({ title: "Success", description: "Category deleted." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete category.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-card shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center"><Tag className="mr-2 h-5 w-5" />Manage Categories</DialogTitle>
          <DialogDescription>Add, edit, or delete payment categories.</DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-grow"
            />
            <Button onClick={handleAddCategory} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          <Label className="font-medium">Existing Categories:</Label>
          <ScrollArea className="h-48 border rounded-md p-2">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No categories yet.</p>
            ) : (
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                    {editingCategory?.id === cat.id ? (
                      <div className="flex-grow flex gap-2 items-center">
                        <Input 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                        />
                        <Button onClick={handleUpdateCategory} size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700">
                          <Save className="h-4 w-4"/>
                        </Button>
                        <Button onClick={() => setEditingCategory(null)} size="sm" variant="ghost">
                          <X className="h-4 w-4"/>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm">{cat.name}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingCategory(cat)}>
                            <Edit2 className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteCategory(cat.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
