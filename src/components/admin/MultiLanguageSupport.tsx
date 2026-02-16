import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Globe, Plus, Edit2, Trash2, Check, Languages, RefreshCw, Download, Upload, Search, Eye, Flag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isDefault: boolean;
  isEnabled: boolean;
  completionRate: number;
  direction: "ltr" | "rtl";
}

interface Translation {
  key: string;
  category: string;
  en: string;
  tw: string;
  ga: string;
  ee: string;
}

const defaultLanguages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "EN", isDefault: true, isEnabled: true, completionRate: 100, direction: "ltr" },
  { code: "tw", name: "Twi", nativeName: "Twi", flag: "TW", isDefault: false, isEnabled: true, completionRate: 85, direction: "ltr" },
  { code: "ga", name: "Ga", nativeName: "Ga", flag: "GA", isDefault: false, isEnabled: true, completionRate: 72, direction: "ltr" },
  { code: "ee", name: "Ewe", nativeName: "Ewe", flag: "EE", isDefault: false, isEnabled: false, completionRate: 45, direction: "ltr" },
];

const defaultTranslations: Translation[] = [
  { key: "nav.home", category: "Navigation", en: "Home", tw: "Fie", ga: "Oyiwaladzing", ee: "Afe" },
  { key: "nav.products", category: "Navigation", en: "Products", tw: "Nneema", ga: "Gbekemoi", ee: "Nudodowo" },
  { key: "nav.cart", category: "Navigation", en: "Cart", tw: "Kenten", ga: "Aloo", ee: "Agba" },
  { key: "nav.orders", category: "Navigation", en: "Orders", tw: "Ahyede", ga: "Afotsemoi", ee: "Asitsitsawo" },
  { key: "nav.contact", category: "Navigation", en: "Contact", tw: "Di me nsa", ga: "Dieng mi", ee: "Ka gbe nam" },
  { key: "btn.add_to_cart", category: "Buttons", en: "Add to Cart", tw: "Fa hye kenten mu", ga: "Fa shi aloo mli", ee: "De do agba me" },
  { key: "btn.checkout", category: "Buttons", en: "Checkout", tw: "Tua ka", ga: "Ye shikpong", ee: "Fle nu" },
  { key: "btn.submit", category: "Buttons", en: "Submit", tw: "Mane", ga: "Ha", ee: "Do da" },
  { key: "btn.cancel", category: "Buttons", en: "Cancel", tw: "Gyae", ga: "Sane", ee: "Dee" },
  { key: "msg.welcome", category: "Messages", en: "Welcome to VibeLink", tw: "Akwaaba VibeLink", ga: "Ojekoo VibeLink", ee: "Woezo de VibeLink" },
  { key: "msg.order_success", category: "Messages", en: "Order placed successfully!", tw: "Wo ahyede no yiye!", ga: "Afotse shi ojogbanng!", ee: "Asitsitsa la dze edzi nyuie!" },
  { key: "msg.thank_you", category: "Messages", en: "Thank you for your order", tw: "Yeda wo ase wo wo ahyede ho", ga: "Oyiwaladon ni afotsemo fee", ee: "Akpe na wo de wo asitsitsa ta" },
  { key: "label.name", category: "Labels", en: "Name", tw: "Din", ga: "Gbee", ee: "Nko" },
  { key: "label.email", category: "Labels", en: "Email", tw: "Email", ga: "Email", ee: "Email" },
  { key: "label.phone", category: "Labels", en: "Phone", tw: "Telefon", ga: "Telifon", ee: "Telefon" },
  { key: "label.address", category: "Labels", en: "Address", tw: "Atenae", ga: "Engoshishi", ee: "Afenguti" },
  { key: "label.total", category: "Labels", en: "Total", tw: "Ne nyinaa bomu", ga: "Le bii keha", ee: "Fomevi" },
  { key: "label.price", category: "Labels", en: "Price", tw: "Bo", ga: "Shikpong", ee: "Asixoxo" },
  { key: "product.desc", category: "Products", en: "Description", tw: "Nsem", ga: "Bolemo", ee: "Nunglodi" },
  { key: "product.qty", category: "Products", en: "Quantity", tw: "Dodow", ga: "Pii", ee: "Gbososo" },
];

export const MultiLanguageSupport = () => {
  const [languages, setLanguages] = useState<Language[]>(defaultLanguages);
  const [translations, setTranslations] = useState<Translation[]>(defaultTranslations);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [formData, setFormData] = useState({ key: "", category: "Navigation", en: "", tw: "", ga: "", ee: "" });
  const [newLangData, setNewLangData] = useState({ code: "", name: "", nativeName: "", flag: "" });

  useEffect(() => {
    // Load settings from localStorage or use defaults
    const stored = localStorage.getItem("multi_language_settings");
    if (stored) { try { const data = JSON.parse(stored); if (data.languages) setLanguages(data.languages); if (data.translations) setTranslations(data.translations); } catch (e) { console.error(e); } }
    
  }, []);

  const saveSettings = (langs?: Language[], trans?: Translation[]) => {
    const newLangs = langs || languages;
    const newTrans = trans || translations;
    setLanguages(newLangs);
    setTranslations(newTrans);
    localStorage.setItem("multi_language_settings", JSON.stringify({ languages: newLangs, translations: newTrans }));
  };

  const handleToggleLanguage = (code: string) => {
    const updated = languages.map((l) => l.code === code ? { ...l, isEnabled: !l.isEnabled } : l);
    saveSettings(updated);
    toast.success(`${code.toUpperCase()} ${updated.find((l) => l.code === code)?.isEnabled ? "enabled" : "disabled"}`);
  };

  const handleSetDefault = (code: string) => {
    const updated = languages.map((l) => ({ ...l, isDefault: l.code === code }));
    saveSettings(updated);
    toast.success(`${code.toUpperCase()} set as default language`);
  };

  const handleAddTranslation = () => {
    if (!formData.key || !formData.en) {
      toast.error("Key and English text required");
      return;
    }
    const newTrans: Translation = { ...formData };
    saveSettings(undefined, [...translations, newTrans]);
    setShowAddDialog(false);
    setFormData({ key: "", category: "Navigation", en: "", tw: "", ga: "", ee: "" });
    toast.success("Translation added");
  };

  const handleEditTranslation = () => {
    if (!editingTranslation) return;
    const updated = translations.map((t) => t.key === editingTranslation.key ? { ...formData } : t);
    saveSettings(undefined, updated);
    setShowEditDialog(false);
    setEditingTranslation(null);
    toast.success("Translation updated");
  };

  const handleDeleteTranslation = (key: string) => {
    saveSettings(undefined, translations.filter((t) => t.key !== key));
    toast.success("Translation deleted");
  };

  const openEditDialog = (trans: Translation) => {
    setEditingTranslation(trans);
    setFormData({ ...trans });
    setShowEditDialog(true);
  };

  const exportTranslations = () => {
    const csv = [
      ["Key", "Category", "English", "Twi", "Ga", "Ewe"],
      ...translations.map((t) => [t.key, t.category, t.en, t.tw, t.ga, t.ee]),
    ].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "translations.csv";
    a.click();
    toast.success("Translations exported");
  };

  const categories = [...new Set(translations.map((t) => t.category))];
  const filteredTranslations = translations.filter((t) => {
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (searchTerm && !t.key.toLowerCase().includes(searchTerm.toLowerCase()) && !t.en.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const enabledLanguages = languages.filter((l) => l.isEnabled);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-indigo-600" />Multi-Language Support</h2>
          <p className="text-gray-600 mt-1">Manage translations for Twi, Ga, and Ewe</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTranslations}><Download className="h-4 w-4 mr-2" />Export</Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />Add Translation</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Add Translation</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Key</Label><Input value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} placeholder="nav.home" /></div>
                  <div><Label>Category</Label><Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Navigation">Navigation</SelectItem><SelectItem value="Buttons">Buttons</SelectItem><SelectItem value="Messages">Messages</SelectItem><SelectItem value="Labels">Labels</SelectItem><SelectItem value="Products">Products</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                </div>
                <div><Label>[EN] English</Label><Input value={formData.en} onChange={(e) => setFormData({ ...formData, en: e.target.value })} placeholder="English text" /></div>
                <div><Label>[TW] Twi</Label><Input value={formData.tw} onChange={(e) => setFormData({ ...formData, tw: e.target.value })} placeholder="Twi translation" /></div>
                <div><Label>[GA] Ga</Label><Input value={formData.ga} onChange={(e) => setFormData({ ...formData, ga: e.target.value })} placeholder="Ga translation" /></div>
                <div><Label>[EE] Ewe</Label><Input value={formData.ee} onChange={(e) => setFormData({ ...formData, ee: e.target.value })} placeholder="Ewe translation" /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button><Button onClick={handleAddTranslation}>Add</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {languages.map((lang) => (
          <Card key={lang.code} className={`relative ${!lang.isEnabled ? "opacity-60" : ""}`}>
            {lang.isDefault && <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-800">Default</Badge>}
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{lang.flag}</span>
                <div><p className="font-bold">{lang.name}</p><p className="text-sm text-gray-500">{lang.nativeName}</p></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Completion</span><span>{lang.completionRate}%</span></div>
                <Progress value={lang.completionRate} className="h-2" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleToggleLanguage(lang.code)}>{lang.isEnabled ? "Disable" : "Enable"}</Button>
                {!lang.isDefault && lang.isEnabled && <Button variant="outline" size="sm" onClick={() => handleSetDefault(lang.code)}>Set Default</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="overview">Translations</TabsTrigger><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger></TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Translation Strings</CardTitle><CardDescription>{translations.length} strings, {categories.length} categories</CardDescription></div>
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-48" /></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Key</TableHead><TableHead>Category</TableHead><TableHead>[EN] English</TableHead><TableHead>[TW] Twi</TableHead><TableHead>[GA] Ga</TableHead><TableHead>[EE] Ewe</TableHead><TableHead>Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTranslations.map((trans) => (
                      <TableRow key={trans.key}>
                        <TableCell className="font-mono text-sm">{trans.key}</TableCell>
                        <TableCell><Badge variant="outline">{trans.category}</Badge></TableCell>
                        <TableCell>{trans.en}</TableCell>
                        <TableCell className={!trans.tw ? "text-red-500" : ""}>{trans.tw || "???"}</TableCell>
                        <TableCell className={!trans.ga ? "text-red-500" : ""}>{trans.ga || "???"}</TableCell>
                        <TableCell className={!trans.ee ? "text-red-500" : ""}>{trans.ee || "???"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(trans)}><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteTranslation(trans.key)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader><CardTitle>Live Preview</CardTitle><CardDescription>See how translations appear</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enabledLanguages.map((lang) => (
                  <div key={lang.code} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b"><span className="text-xl">{lang.flag}</span><span className="font-bold">{lang.name}</span></div>
                    <div className="space-y-3">
                      <div className="flex gap-2">{["nav.home", "nav.products", "nav.cart", "nav.contact"].map((key) => { const t = translations.find((x) => x.key === key); return <Button key={key} variant="ghost" size="sm">{t?.[lang.code as keyof Translation] || t?.en || key}</Button>; })}</div>
                      <div className="bg-gray-50 p-4 rounded-lg"><p className="text-lg font-medium">{translations.find((t) => t.key === "msg.welcome")?.[lang.code as keyof Translation] || "Welcome"}</p></div>
                      <div className="flex gap-2"><Button size="sm">{translations.find((t) => t.key === "btn.add_to_cart")?.[lang.code as keyof Translation] || "Add to Cart"}</Button><Button size="sm" variant="outline">{translations.find((t) => t.key === "btn.checkout")?.[lang.code as keyof Translation] || "Checkout"}</Button></div>
                      <div className="space-y-2 text-sm"><p><strong>{translations.find((t) => t.key === "label.name")?.[lang.code as keyof Translation] || "Name"}:</strong> Kofi Mensah</p><p><strong>{translations.find((t) => t.key === "label.total")?.[lang.code as keyof Translation] || "Total"}:</strong> GHS 150.00</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Language Settings</CardTitle><CardDescription>Configure language behavior</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><h4 className="font-medium">Auto-detect user language</h4><p className="text-sm text-gray-500">Use browser language preference</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><h4 className="font-medium">Language selector in header</h4><p className="text-sm text-gray-500">Show language switcher to visitors</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><h4 className="font-medium">Remember language preference</h4><p className="text-sm text-gray-500">Save user's language choice</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div><h4 className="font-medium">Show missing translation warnings</h4><p className="text-sm text-gray-500">Highlight untranslated strings in admin</p></div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 border rounded-lg bg-amber-50">
                <h4 className="font-medium text-amber-800 mb-2">Translation Progress</h4>
                <div className="space-y-2">
                  {languages.filter((l) => l.code !== "en").map((lang) => {
                    const translated = translations.filter((t) => t[lang.code as keyof Translation]).length;
                    const percent = Math.round((translated / translations.length) * 100);
                    return (
                      <div key={lang.code}>
                        <div className="flex justify-between text-sm mb-1"><span>{lang.flag} {lang.name}</span><span>{translated}/{translations.length} ({percent}%)</span></div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Translation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Key</Label><Input value={formData.key} disabled className="bg-gray-50" /></div>
              <div><Label>Category</Label><Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Navigation">Navigation</SelectItem><SelectItem value="Buttons">Buttons</SelectItem><SelectItem value="Messages">Messages</SelectItem><SelectItem value="Labels">Labels</SelectItem><SelectItem value="Products">Products</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>[EN] English</Label><Input value={formData.en} onChange={(e) => setFormData({ ...formData, en: e.target.value })} /></div>
            <div><Label>[TW] Twi</Label><Input value={formData.tw} onChange={(e) => setFormData({ ...formData, tw: e.target.value })} /></div>
            <div><Label>[GA] Ga</Label><Input value={formData.ga} onChange={(e) => setFormData({ ...formData, ga: e.target.value })} /></div>
            <div><Label>[EE] Ewe</Label><Input value={formData.ee} onChange={(e) => setFormData({ ...formData, ee: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button><Button onClick={handleEditTranslation}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

