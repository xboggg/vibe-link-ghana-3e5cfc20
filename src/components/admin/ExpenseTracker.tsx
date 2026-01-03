import { useState, useEffect } from "react";
import {
  Plus, Search, Receipt, TrendingUp, TrendingDown, Wallet,
  Loader2, Trash2, Edit, Filter, Calendar, Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface Expense {
  id: string;
  category_id: string | null;
  order_id: string | null;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  expense_categories?: { name: string; color: string } | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_active: boolean;
}

interface Revenue {
  total: number;
  count: number;
}

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [revenue, setRevenue] = useState<Revenue>({ total: 0, count: 0 });

  const [formData, setFormData] = useState({
    category_id: "",
    description: "",
    amount: 0,
    expense_date: format(new Date(), "yyyy-MM-dd"),
    payment_method: "cash",
    notes: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    fetchRevenue();
  }, [dateRange]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from("expense_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*, expense_categories(name, color)")
        .gte("expense_date", dateRange.start)
        .lte("expense_date", dateRange.end)
        .order("expense_date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      const { data } = await supabase
        .from("orders")
        .select("total_price")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end + "T23:59:59")
        .in("order_status", ["completed"]);

      const total = (data || []).reduce((sum, order) => sum + (order.total_price || 0), 0);
      setRevenue({ total, count: data?.length || 0 });
    } catch (err) {
      console.error("Error fetching revenue:", err);
    }
  };

  const saveExpense = async () => {
    if (!formData.description || !formData.amount) {
      toast.error("Please fill required fields");
      return;
    }

    setIsSaving(true);
    try {
      const expenseData = {
        category_id: formData.category_id || null,
        description: formData.description,
        amount: formData.amount,
        expense_date: formData.expense_date,
        payment_method: formData.payment_method,
        notes: formData.notes || null,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq("id", editingExpense.id);
        if (error) throw error;
        toast.success("Expense updated");
      } else {
        const { error } = await supabase
          .from("expenses")
          .insert(expenseData);
        if (error) throw error;
        toast.success("Expense added");
      }

      setIsAddOpen(false);
      setEditingExpense(null);
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error("Error saving expense:", err);
      toast.error("Failed to save expense");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await supabase.from("expenses").delete().eq("id", id);
      toast.success("Expense deleted");
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const editExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category_id: expense.category_id || "",
      description: expense.description,
      amount: expense.amount,
      expense_date: expense.expense_date,
      payment_method: expense.payment_method || "cash",
      notes: expense.notes || "",
    });
    setIsAddOpen(true);
  };

  const resetForm = () => {
    setFormData({
      category_id: "",
      description: "",
      amount: 0,
      expense_date: format(new Date(), "yyyy-MM-dd"),
      payment_method: "cash",
      notes: "",
    });
  };

  const setQuickDateRange = (months: number) => {
    const end = new Date();
    const start = subMonths(startOfMonth(end), months - 1);
    setDateRange({
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    });
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || exp.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = revenue.total - totalExpenses;

  const expensesByCategory = categories.map(cat => {
    const catExpenses = expenses.filter(e => e.category_id === cat.id);
    const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { ...cat, total, count: catExpenses.length };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Expense & Revenue Tracker</h2>
          <p className="text-muted-foreground">Track business expenses and profit</p>
        </div>
        <Button onClick={() => { setEditingExpense(null); resetForm(); setIsAddOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">GHS {revenue.total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{revenue.count} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">GHS {totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{filteredExpenses.length} entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              GHS {netProfit.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {revenue.total > 0 ? ((netProfit / revenue.total) * 100).toFixed(1) : 0}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory[0] ? (
              <>
                <p className="text-lg font-bold">{expensesByCategory[0].name}</p>
                <p className="text-xs text-muted-foreground">
                  GHS {expensesByCategory[0].total.toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No expenses</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setQuickDateRange(1)}>This Month</Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDateRange(3)}>3 Months</Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDateRange(12)}>Year</Button>
        </div>
      </div>

      {/* Date Range Inputs */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-40"
          />
        </div>
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="w-40"
        />
      </div>

      {/* Category Breakdown */}
      {expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expensesByCategory.map(cat => (
                <div key={cat.id} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1">{cat.name}</span>
                  <span className="text-muted-foreground">{cat.count} items</span>
                  <span className="font-medium">GHS {cat.total.toLocaleString()}</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: cat.color,
                        width: `${(cat.total / totalExpenses) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {format(new Date(expense.expense_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{expense.description}</p>
                        {expense.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{expense.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {expense.expense_categories ? (
                        <Badge
                          variant="outline"
                          style={{ borderColor: expense.expense_categories.color, color: expense.expense_categories.color }}
                        >
                          {expense.expense_categories.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{expense.payment_method || "-"}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      GHS {expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => editExpense(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteExpense(expense.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Description *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What was this expense for?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (GHS) *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="momo">Mobile Money</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveExpense} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editingExpense ? "Update" : "Add"} Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ExpenseTracker;

