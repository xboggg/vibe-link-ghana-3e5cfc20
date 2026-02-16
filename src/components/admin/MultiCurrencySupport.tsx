import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { DollarSign, RefreshCw, Settings, Globe, TrendingUp, ArrowRightLeft, Plus, Edit2, Trash2, Check, Star, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
  isEnabled: boolean;
  lastUpdated: string;
  flag: string;
}

interface ConversionLog {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: string;
}

const defaultCurrencies: Currency[] = [
  { code: "GHS", name: "Ghana Cedi", symbol: "GHS", rate: 1, isDefault: true, isEnabled: true, lastUpdated: new Date().toISOString(), flag: "GH" },
  { code: "USD", name: "US Dollar", symbol: "$", rate: 0.08, isDefault: false, isEnabled: true, lastUpdated: new Date().toISOString(), flag: "US" },
  { code: "EUR", name: "Euro", symbol: "EUR", rate: 0.073, isDefault: false, isEnabled: true, lastUpdated: new Date().toISOString(), flag: "EU" },
  { code: "GBP", name: "British Pound", symbol: "GBP", rate: 0.063, isDefault: false, isEnabled: true, lastUpdated: new Date().toISOString(), flag: "GB" },
  { code: "NGN", name: "Nigerian Naira", symbol: "NGN", rate: 123.5, isDefault: false, isEnabled: false, lastUpdated: new Date().toISOString(), flag: "NG" },
  { code: "XOF", name: "CFA Franc", symbol: "CFA", rate: 48.2, isDefault: false, isEnabled: false, lastUpdated: new Date().toISOString(), flag: "XOF" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", rate: 12.8, isDefault: false, isEnabled: false, lastUpdated: new Date().toISOString(), flag: "KE" },
  { code: "ZAR", name: "South African Rand", symbol: "R", rate: 1.48, isDefault: false, isEnabled: false, lastUpdated: new Date().toISOString(), flag: "ZA" },
];

export const MultiCurrencySupport = () => {
  const [currencies, setCurrencies] = useState<Currency[]>(defaultCurrencies);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [conversionLogs, setConversionLogs] = useState<ConversionLog[]>([]);
  const [converterFrom, setConverterFrom] = useState("GHS");
  const [converterTo, setConverterTo] = useState("USD");
  const [converterAmount, setConverterAmount] = useState("100");
  const [converterResult, setConverterResult] = useState<number | null>(null);
  const [formData, setFormData] = useState({ code: "", name: "", symbol: "", rate: "", flag: "" });
  const [autoUpdate, setAutoUpdate] = useState(true);

  useEffect(() => {
    // Clear old localStorage data with broken emoji flags and use fresh defaults
    localStorage.removeItem("multi_currency_settings");
    setCurrencies(defaultCurrencies);
    setConversionLogs([]);
  }, []);

  const saveSettings = (newCurrencies: Currency[], newLogs?: ConversionLog[]) => {
    setCurrencies(newCurrencies);
    if (newLogs) setConversionLogs(newLogs);
    localStorage.setItem("multi_currency_settings", JSON.stringify({ currencies: newCurrencies, logs: newLogs || conversionLogs }));
  };

  const handleUpdateRates = async () => {
    setLoading(true);
    // Simulate API call for exchange rates
    await new Promise((r) => setTimeout(r, 1500));
    const updated = currencies.map((c) => ({
      ...c,
      rate: c.code === "GHS" ? 1 : c.rate * (0.98 + Math.random() * 0.04),
      lastUpdated: new Date().toISOString(),
    }));
    saveSettings(updated);
    toast.success("Exchange rates updated");
    setLoading(false);
  };

  const handleConvert = () => {
    const fromCurrency = currencies.find((c) => c.code === converterFrom);
    const toCurrency = currencies.find((c) => c.code === converterTo);
    if (!fromCurrency || !toCurrency) return;

    const amountInGHS = parseFloat(converterAmount) / fromCurrency.rate;
    const result = amountInGHS * toCurrency.rate;
    setConverterResult(result);

    const log: ConversionLog = {
      id: Date.now().toString(),
      from: converterFrom,
      to: converterTo,
      amount: parseFloat(converterAmount),
      result,
      rate: toCurrency.rate / fromCurrency.rate,
      timestamp: new Date().toISOString(),
    };
    saveSettings(currencies, [log, ...conversionLogs.slice(0, 99)]);
  };

  const handleToggleCurrency = (code: string) => {
    const updated = currencies.map((c) => c.code === code ? { ...c, isEnabled: !c.isEnabled } : c);
    saveSettings(updated);
    toast.success(`${code} ${updated.find((c) => c.code === code)?.isEnabled ? "enabled" : "disabled"}`);
  };

  const handleSetDefault = (code: string) => {
    const updated = currencies.map((c) => ({ ...c, isDefault: c.code === code }));
    saveSettings(updated);
    toast.success(`${code} set as default currency`);
  };

  const handleAddCurrency = () => {
    if (!formData.code || !formData.name || !formData.symbol || !formData.rate) {
      toast.error("Please fill all fields");
      return;
    }
    const newCurrency: Currency = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      symbol: formData.symbol,
      rate: parseFloat(formData.rate),
      isDefault: false,
      isEnabled: true,
      lastUpdated: new Date().toISOString(),
      flag: formData.flag || "????",
    };
    saveSettings([...currencies, newCurrency]);
    setShowAddDialog(false);
    setFormData({ code: "", name: "", symbol: "", rate: "", flag: "" });
    toast.success("Currency added");
  };

  const handleEditCurrency = () => {
    if (!editingCurrency) return;
    const updated = currencies.map((c) =>
      c.code === editingCurrency.code
        ? { ...c, name: formData.name, symbol: formData.symbol, rate: parseFloat(formData.rate), flag: formData.flag || c.flag }
        : c
    );
    saveSettings(updated);
    setShowEditDialog(false);
    setEditingCurrency(null);
    toast.success("Currency updated");
  };

  const handleDeleteCurrency = (code: string) => {
    if (code === "GHS") {
      toast.error("Cannot delete default currency");
      return;
    }
    saveSettings(currencies.filter((c) => c.code !== code));
    toast.success("Currency removed");
  };

  const openEditDialog = (currency: Currency) => {
    setEditingCurrency(currency);
    setFormData({ code: currency.code, name: currency.name, symbol: currency.symbol, rate: currency.rate.toString(), flag: currency.flag });
    setShowEditDialog(true);
  };

  const enabledCurrencies = currencies.filter((c) => c.isEnabled);
  const defaultCurrency = currencies.find((c) => c.isDefault);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6 text-indigo-600" />Multi-Currency Support</h2>
          <p className="text-gray-600 mt-1">Manage currencies and exchange rates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUpdateRates} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />Update Rates</Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />Add Currency</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Currency</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Code</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="USD" maxLength={3} /></div>
                  <div><Label>Flag/Emoji</Label><Input value={formData.flag} onChange={(e) => setFormData({ ...formData, flag: e.target.value })} placeholder="????????" /></div>
                </div>
                <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="US Dollar" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Symbol</Label><Input value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} placeholder="$" /></div>
                  <div><Label>Rate (1 GHS =)</Label><Input type="number" step="0.0001" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} placeholder="0.08" /></div>
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button><Button onClick={handleAddCurrency}>Add</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Default Currency</p><p className="text-2xl font-bold">{defaultCurrency?.code}</p></div><Star className="h-8 w-8 text-amber-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Active Currencies</p><p className="text-2xl font-bold">{enabledCurrencies.length}</p></div><Globe className="h-8 w-8 text-indigo-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Currencies</p><p className="text-2xl font-bold">{currencies.length}</p></div><DollarSign className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Conversions Today</p><p className="text-2xl font-bold">{conversionLogs.filter((l) => format(new Date(l.timestamp), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length}</p></div><ArrowRightLeft className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="overview">Currencies</TabsTrigger><TabsTrigger value="converter">Converter</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Currency Rates</CardTitle><CardDescription>Manage and update exchange rates</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Currency</TableHead><TableHead>Code</TableHead><TableHead>Symbol</TableHead><TableHead>Rate (1 GHS)</TableHead><TableHead>Last Updated</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {currencies.map((currency) => (
                    <TableRow key={currency.code}>
                      <TableCell><div className="flex items-center gap-2"><span className="text-2xl">{currency.flag}</span><span className="font-medium">{currency.name}</span>{currency.isDefault && <Badge className="ml-2 bg-amber-100 text-amber-800">Default</Badge>}</div></TableCell>
                      <TableCell><Badge variant="outline">{currency.code}</Badge></TableCell>
                      <TableCell>{currency.symbol}</TableCell>
                      <TableCell>{currency.rate.toFixed(4)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{format(new Date(currency.lastUpdated), "MMM d, HH:mm")}</TableCell>
                      <TableCell><Switch checked={currency.isEnabled} onCheckedChange={() => handleToggleCurrency(currency.code)} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!currency.isDefault && <Button variant="ghost" size="icon" onClick={() => handleSetDefault(currency.code)} title="Set as default"><Star className="h-4 w-4" /></Button>}
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(currency)}><Edit2 className="h-4 w-4" /></Button>
                          {currency.code !== "GHS" && <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteCurrency(currency.code)}><Trash2 className="h-4 w-4" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="converter">
          <Card>
            <CardHeader><CardTitle>Currency Converter</CardTitle><CardDescription>Convert between currencies</CardDescription></CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto space-y-6">
                <div className="grid grid-cols-5 gap-4 items-end">
                  <div className="col-span-2"><Label>Amount</Label><Input type="number" value={converterAmount} onChange={(e) => setConverterAmount(e.target.value)} placeholder="100" /></div>
                  <div><Label>From</Label><Select value={converterFrom} onValueChange={setConverterFrom}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{enabledCurrencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>)}</SelectContent></Select></div>
                  <div className="flex justify-center"><ArrowRightLeft className="h-6 w-6 text-gray-400" /></div>
                  <div><Label>To</Label><Select value={converterTo} onValueChange={setConverterTo}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{enabledCurrencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <Button className="w-full" onClick={handleConvert}>Convert</Button>
                {converterResult !== null && (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">{converterAmount} {converterFrom} =</p>
                    <p className="text-3xl font-bold text-indigo-600">{currencies.find((c) => c.code === converterTo)?.symbol}{converterResult.toFixed(2)} {converterTo}</p>
                    <p className="text-xs text-gray-400 mt-2">Rate: 1 {converterFrom} = {(converterResult / parseFloat(converterAmount)).toFixed(4)} {converterTo}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Currency Settings</CardTitle><CardDescription>Configure currency behavior</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><h4 className="font-medium">Auto-update exchange rates</h4><p className="text-sm text-gray-500">Automatically fetch latest rates daily</p></div>
                <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><h4 className="font-medium">Show prices in multiple currencies</h4><p className="text-sm text-gray-500">Display alternative currency on product pages</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><h4 className="font-medium">Currency selector in header</h4><p className="text-sm text-gray-500">Allow customers to switch currencies</p></div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 border rounded-lg">
                <Label>Decimal Places</Label>
                <Select defaultValue="2"><SelectTrigger className="mt-2 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">0</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="4">4</SelectItem></SelectContent></Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Conversion History</CardTitle><CardDescription>Recent currency conversions</CardDescription></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Amount</TableHead><TableHead>Result</TableHead><TableHead>Rate</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {conversionLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{format(new Date(log.timestamp), "MMM d, HH:mm")}</TableCell>
                        <TableCell><Badge variant="outline">{log.from}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{log.to}</Badge></TableCell>
                        <TableCell>{log.amount.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">{log.result.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-500">{log.rate.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                    {conversionLogs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No conversions yet</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Currency</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Symbol</Label><Input value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} /></div>
              <div><Label>Flag</Label><Input value={formData.flag} onChange={(e) => setFormData({ ...formData, flag: e.target.value })} /></div>
            </div>
            <div><Label>Rate (1 GHS =)</Label><Input type="number" step="0.0001" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button><Button onClick={handleEditCurrency}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

