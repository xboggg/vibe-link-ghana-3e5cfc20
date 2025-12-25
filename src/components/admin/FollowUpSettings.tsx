import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, RefreshCw, Mail, Clock, FileText, Eye, EyeOff } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface FollowUpSetting {
  id: string;
  follow_up_type: string;
  enabled: boolean;
  days_after: number;
  email_subject: string;
  email_template: string;
  updated_at: string;
}

const followUpTypeLabels: Record<string, { label: string; description: string; emoji: string }> = {
  payment_reminder_3_days: {
    label: 'First Payment Reminder',
    description: 'Sent when payment is pending',
    emoji: '💳'
  },
  payment_reminder_7_days: {
    label: 'Final Payment Reminder',
    description: 'Follow-up for still-pending payments',
    emoji: '⏰'
  },
  draft_review_reminder: {
    label: 'Draft Review Reminder',
    description: 'Sent when draft is ready for review',
    emoji: '🎨'
  },
  completion_thank_you: {
    label: 'Completion Thank You',
    description: 'Sent after order is completed',
    emoji: '🎉'
  }
};

const templateVariables = [
  { variable: '{{client_name}}', description: 'Client\'s full name' },
  { variable: '{{order_id}}', description: 'Order ID (short format)' },
  { variable: '{{event_title}}', description: 'Event title' },
  { variable: '{{total_price}}', description: 'Total order price' },
  { variable: '{{event_date}}', description: 'Event date' },
  { variable: '{{package_name}}', description: 'Selected package name' }
];

export function FollowUpSettings() {
  const [settings, setSettings] = useState<FollowUpSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedSettings, setEditedSettings] = useState<Record<string, Partial<FollowUpSetting>>>({});
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('follow_up_settings')
        .select('*')
        .order('follow_up_type');

      if (error) throw error;
      setSettings(data || []);
      setEditedSettings({});
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, field: keyof FollowUpSetting, value: any) => {
    setEditedSettings(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const getCurrentValue = (setting: FollowUpSetting, field: keyof FollowUpSetting) => {
    return editedSettings[setting.id]?.[field] ?? setting[field];
  };

  const hasChanges = (id: string) => {
    return Object.keys(editedSettings[id] || {}).length > 0;
  };

  const saveSetting = async (setting: FollowUpSetting) => {
    if (!hasChanges(setting.id)) return;

    setSaving(setting.id);
    try {
      const updates = editedSettings[setting.id];
      const { error } = await supabase
        .from('follow_up_settings')
        .update(updates)
        .eq('id', setting.id);

      if (error) throw error;

      toast.success('Settings saved successfully');
      
      // Update local state
      setSettings(prev => prev.map(s => 
        s.id === setting.id ? { ...s, ...updates } : s
      ));
      
      // Clear edited state for this setting
      setEditedSettings(prev => {
        const { [setting.id]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Follow-up Email Settings</h2>
          <p className="text-muted-foreground">
            Configure automated follow-up emails and customize templates
          </p>
        </div>
        <Button variant="outline" onClick={fetchSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Template Variables Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Available Template Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {templateVariables.map(({ variable, description }) => (
              <Badge 
                key={variable} 
                variant="secondary" 
                className="cursor-help"
                title={description}
              >
                {variable}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue={settings[0]?.follow_up_type} className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 h-auto gap-2">
          {settings.map(setting => {
            const typeInfo = followUpTypeLabels[setting.follow_up_type];
            const isEnabled = getCurrentValue(setting, 'enabled');
            return (
              <TabsTrigger 
                key={setting.follow_up_type} 
                value={setting.follow_up_type}
                className="flex flex-col items-start p-3 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="flex items-center gap-2">
                  <span>{typeInfo?.emoji}</span>
                  <span className="text-xs font-medium">{typeInfo?.label}</span>
                </span>
                <Badge 
                  variant={isEnabled ? "default" : "secondary"} 
                  className="mt-1 text-[10px]"
                >
                  {isEnabled ? 'Active' : 'Disabled'}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {settings.map(setting => {
          const typeInfo = followUpTypeLabels[setting.follow_up_type];
          return (
            <TabsContent key={setting.follow_up_type} value={setting.follow_up_type}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {typeInfo?.emoji} {typeInfo?.label}
                      </CardTitle>
                      <CardDescription>{typeInfo?.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={getCurrentValue(setting, 'enabled') as boolean}
                          onCheckedChange={(checked) => handleChange(setting.id, 'enabled', checked)}
                        />
                        <Label>Enabled</Label>
                      </div>
                      <Button 
                        onClick={() => saveSetting(setting)}
                        disabled={!hasChanges(setting.id) || saving === setting.id}
                      >
                        {saving === setting.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Schedule */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Schedule (Days After Condition)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={getCurrentValue(setting, 'days_after') as number}
                        onChange={(e) => handleChange(setting.id, 'days_after', parseInt(e.target.value) || 1)}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">
                        days after {setting.follow_up_type.includes('payment') ? 'order creation' : 
                                    setting.follow_up_type.includes('draft') ? 'draft ready' : 
                                    'order completion'}
                      </span>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Subject
                    </Label>
                    <Input
                      value={getCurrentValue(setting, 'email_subject') as string}
                      onChange={(e) => handleChange(setting.id, 'email_subject', e.target.value)}
                      placeholder="Enter email subject..."
                    />
                  </div>

                  {/* Template with Rich Text Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Email Template
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(prev => ({ ...prev, [setting.id]: !prev[setting.id] }))}
                        className="gap-2"
                      >
                        {showPreview[setting.id] ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Hide Preview
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Show Preview
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <RichTextEditor
                        content={getCurrentValue(setting, 'email_template') as string}
                        onChange={(value) => handleChange(setting.id, 'email_template', value)}
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Use template variables like {"{{client_name}}"} to personalize emails. Available: {"{{client_name}}"}, {"{{order_id}}"}, {"{{event_title}}"}, {"{{total_price}}"}, {"{{event_date}}"}, {"{{package_name}}"}
                    </p>
                  </div>

                  {/* Preview (toggleable) */}
                  {showPreview[setting.id] && (
                    <div className="space-y-2">
                      <Label>Email Preview</Label>
                      <div 
                        className="border rounded-lg p-4 bg-background prose prose-sm max-w-none dark:prose-invert [&_p]:my-4 [&_br]:block [&_br]:content-[''] [&_br]:my-2"
                        dangerouslySetInnerHTML={{ 
                          __html: (getCurrentValue(setting, 'email_template') as string)
                            .replace(/\{\{client_name\}\}/g, 'John Doe')
                            .replace(/\{\{order_id\}\}/g, 'ABC123')
                            .replace(/\{\{event_title\}\}/g, 'Wedding Celebration')
                            .replace(/\{\{total_price\}\}/g, '150,000')
                            .replace(/\{\{event_date\}\}/g, 'March 15, 2025')
                            .replace(/\{\{package_name\}\}/g, 'Premium Package')
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
