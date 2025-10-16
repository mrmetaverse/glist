"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ShoppingCart } from "lucide-react";
import type { GroceryItem } from "@/app/page";

type GroceryListProps = {
  items: GroceryItem[];
  setItems: (items: GroceryItem[]) => void;
};

export function GroceryList({ items, setItems }: GroceryListProps) {
  const toggleComplete = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setItems(items.filter((item) => !item.completed));
  };

  const activeItems = items.filter((item) => !item.completed);
  const completedItems = items.filter((item) => item.completed);

  const groupedItems = activeItems.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const categories = Object.keys(groupedItems).sort();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Your List</h2>
        </div>
        {completedItems.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompleted} className="text-muted-foreground hover:text-foreground">
            Clear completed
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Your list is empty. Start by saying "Add [item] to my list"</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeItems.length > 0 && (
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{category}</h3>
                  <div className="space-y-2">
                    {groupedItems[category].map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <Checkbox checked={item.completed} onCheckedChange={() => toggleComplete(item.id)} className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{item.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {item.quantity && (
                                  <span className="text-sm text-muted-foreground">Qty: {item.quantity} {item.unit || ""}</span>
                                )}
                              </div>
                              {item.priceEstimate && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Est. ${item.priceEstimate.toFixed(2)}
                                  {item.store && ` at ${item.store}`}
                                </p>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {completedItems.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Completed ({completedItems.length})</p>
              {completedItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <Checkbox checked={item.completed} onCheckedChange={() => toggleComplete(item.id)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-muted-foreground line-through">{item.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">{activeItems.length} item{activeItems.length !== 1 ? "s" : ""} to buy</p>
        </div>
      )}
    </Card>
  );
}
