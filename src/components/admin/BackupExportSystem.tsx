import { useState, useEffect } from "react";
import {
  Download, FileJson, FileSpreadsheet, Database, Loader2,
  CheckCircle, Clock, AlertTriangle, RefreshCw, Archive,
  Users, Package, Receipt, BarChart3, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface ExportRecord {
  id: string;
  export_type: string;
  format: string;
  status: string;
  file_url: string | null;
  file_size: number | null;
  records_count: number | null;
  created_at: string;
  completed_at: string | null;
}

type ExportType = "orders" | "customers" | "invoices" | "expenses" | "analytics" | "full_backup";
type ExportFormat = "csv" | "json";

const exportTypeConfig: Record<ExportType, { label: string; icon: React.ReactNode; description: string }> = {
  orders: {
    label: "Orders",
    icon: <Package className="h-5 w-5" />,
    description: "All order data including status and payments"
  },
  customers: {
    label: "Customers",
    icon: <Users className="h-5 w-5" />,
    description: "Customer contacts from orders"
  },
  invoices: {
    label: "Invoices",
    icon: <Receipt className="h-5 w-5" />,
    description: "All invoices with line items"
  },
  expenses: {
    label: "Expenses",
    icon: <Receipt className="h-5 w-5" />,
    description: "Business expenses by category"
  },
  analytics: {
    label: "Analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "Page views and visitor data"
  },
  full_backup: {
    label: "Full Backup",
    icon: <Database className="h-5 w-5" />,
    description: "Complete backup of all data"
  }
};

export function BackupExportSystem() {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportingType, setExportingType] = useState<ExportType | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("data_exports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setExports(data || []);
    } catch (err) {
      console.error("Error fetching exports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";

    const flattenObject = (obj: any, prefix = ""): any => {
      const flattened: any = {};
      for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
          flattened[prefix + key] = "";
        } else if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], `${key}_`));
        } else if (Array.isArray(obj[key])) {
          flattened[prefix + key] = JSON.stringify(obj[key]);
        } else {
          flattened[prefix + key] = obj[key];
        }
      }
      return flattened;
    };

    const flatData = data.map(item => flattenObject(item));
    const headers = Object.keys(flatData[0]);

    const csvRows = [
      headers.join(","),
      ...flatData.map(row =>
        headers.map(header => {
          let cell = row[header] ?? "";
          cell = String(cell).replace(/"/g, '""');
          if (cell.includes(",") || cell.includes("\n") || cell.includes('"')) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(",")
      )
    ];

    return csvRows.join("\n");
  };

  const generateExport = async (type: ExportType) => {
    setExportingType(type);

    try {
      let data: any[] = [];
      let filename = "";

      switch (type) {
        case "orders":
          const { data: orders } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });
          data = orders || [];
          filename = `vibelink-orders-${format(new Date(), "yyyy-MM-dd")}`;
          break;

        case "customers":
          const { data: customerOrders } = await supabase
            .from("orders")
            .select("client_name, client_email, client_phone, client_whatsapp, created_at")
            .order("created_at", { ascending: false });

          const customerMap = new Map();
          (customerOrders || []).forEach(order => {
            if (order.client_email && !customerMap.has(order.client_email)) {
              customerMap.set(order.client_email, {
                name: order.client_name,
                email: order.client_email,
                phone: order.client_phone,
                whatsapp: order.client_whatsapp,
                first_order: order.created_at
              });
            }
          });
          data = Array.from(customerMap.values());
          filename = `vibelink-customers-${format(new Date(), "yyyy-MM-dd")}`;
          break;

        case "invoices":
          const { data: invoices } = await supabase
            .from("invoices")
            .select("*, invoice_items(*)")
            .order("created_at", { ascending: false });
          data = invoices || [];
          filename = `vibelink-invoices-${format(new Date(), "yyyy-MM-dd")}`;
          break;

        case "expenses":
          const { data: expenses } = await supabase
            .from("expenses")
            .select("*, expense_categories(name)")
            .order("expense_date", { ascending: false });
          data = (expenses || []).map(e => ({
            ...e,
            category_name: e.expense_categories?.name || "Uncategorized"
          }));
          filename = `vibelink-expenses-${format(new Date(), "yyyy-MM-dd")}`;
          break;

        case "analytics":
          const { data: pageViews } = await supabase
            .from("page_views")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10000);
          data = pageViews || [];
          filename = `vibelink-analytics-${format(new Date(), "yyyy-MM-dd")}`;
          break;

        case "full_backup":
          const [ordersData, invoicesData, expensesData, analyticsData] = await Promise.all([
            supabase.from("orders").select("*"),
            supabase.from("invoices").select("*, invoice_items(*)"),
            supabase.from("expenses").select("*"),
            supabase.from("page_views").select("*").limit(10000)
          ]);

          data = [{
            exported_at: new Date().toISOString(),
            orders: ordersData.data || [],
            invoices: invoicesData.data || [],
            expenses: expensesData.data || [],
            analytics: analyticsData.data || []
          }];
          filename = `vibelink-full-backup-${format(new Date(), "yyyy-MM-dd")}`;
          break;
      }

      if (data.length === 0) {
        toast.info("No data to export");
        setExportingType(null);
        return;
      }

      let content: string;
      let mimeType: string;
      let extension: string;

      if (selectedFormat === "json") {
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        extension = "json";
      } else {
        content = convertToCSV(data);
        mimeType = "text/csv";
        extension = "csv";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await supabase.from("data_exports").insert({
        export_type: type,
        format: selectedFormat,
        status: "completed",
        records_count: Array.isArray(data) ? data.length : 1,
        file_size: blob.size,
        completed_at: new Date().toISOString()
      });

      toast.success(`${exportTypeConfig[type].label} exported!`);
      fetchExports();
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data");
    } finally {
      setExportingType(null);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const deleteExport = async (id: string) => {
    await supabase.from("data_exports").delete().eq("id", id);
    toast.success("Export record deleted");
    fetchExports();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Backup & Export</h2>
          <p className="text-muted-foreground">Download your data in CSV or JSON</p>
        </div>
        <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ExportFormat)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </div>
            </SelectItem>
            <SelectItem value="json">
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                JSON
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.entries(exportTypeConfig) as [ExportType, typeof exportTypeConfig[ExportType]][]).map(([type, config]) => (
          <Card key={type} className={type === "full_backup" ? "border-primary/50 bg-primary/5" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {config.icon}
                {config.label}
              </CardTitle>
              <CardDescription className="text-sm">{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant={type === "full_backup" ? "default" : "outline"}
                onClick={() => generateExport(type)}
                disabled={exportingType !== null}
              >
                {exportingType === type ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</>
                ) : (
                  <><Download className="h-4 w-4 mr-2" />Export {selectedFormat.toUpperCase()}</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : exports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No exports yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {exportTypeConfig[exp.export_type as ExportType]?.icon}
                        {exportTypeConfig[exp.export_type as ExportType]?.label || exp.export_type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">{exp.format}</Badge>
                    </TableCell>
                    <TableCell>{exp.records_count?.toLocaleString() || "-"}</TableCell>
                    <TableCell>{formatFileSize(exp.file_size)}</TableCell>
                    <TableCell>
                      <Badge className={exp.status === "completed" ? "bg-green-500" : "bg-yellow-500"}>
                        {exp.status === "completed" ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {exp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(exp.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => deleteExport(exp.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BackupExportSystem;

