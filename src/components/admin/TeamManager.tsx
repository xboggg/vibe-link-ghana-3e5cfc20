import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Upload,
  GripVertical,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  bio: z.string().max(500).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  social_facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  social_twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  social_instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  social_linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  is_active: z.boolean(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

export function TeamManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      role: "",
      bio: "",
      email: "",
      phone: "",
      social_facebook: "",
      social_twitter: "",
      social_instagram: "",
      social_linkedin: "",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } else {
      setTeamMembers(data || []);
    }
    setLoading(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (memberId: string): Promise<string | null> => {
    if (!photoFile) return selectedMember?.photo_url || null;

    setUploading(true);
    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${memberId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("team-photos")
      .upload(fileName, photoFile, { upsert: true });

    if (uploadError) {
      console.error("Error uploading photo:", uploadError);
      toast.error("Failed to upload photo");
      setUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("team-photos")
      .getPublicUrl(fileName);

    setUploading(false);
    return urlData.publicUrl;
  };

  const openCreateDialog = () => {
    setSelectedMember(null);
    form.reset({
      name: "",
      role: "",
      bio: "",
      email: "",
      phone: "",
      social_facebook: "",
      social_twitter: "",
      social_instagram: "",
      social_linkedin: "",
      is_active: true,
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    form.reset({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      email: member.email || "",
      phone: member.phone || "",
      social_facebook: member.social_facebook || "",
      social_twitter: member.social_twitter || "",
      social_instagram: member.social_instagram || "",
      social_linkedin: member.social_linkedin || "",
      is_active: member.is_active,
    });
    setPhotoPreview(member.photo_url);
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const onSubmit = async (data: TeamMemberFormData) => {
    setSaving(true);

    try {
      if (selectedMember) {
        // Update existing member
        const photoUrl = await uploadPhoto(selectedMember.id);

        const { error } = await supabase
          .from("team_members")
          .update({
            name: data.name,
            role: data.role,
            bio: data.bio || null,
            email: data.email || null,
            phone: data.phone || null,
            social_facebook: data.social_facebook || null,
            social_twitter: data.social_twitter || null,
            social_instagram: data.social_instagram || null,
            social_linkedin: data.social_linkedin || null,
            is_active: data.is_active,
            photo_url: photoUrl,
          })
          .eq("id", selectedMember.id);

        if (error) throw error;
        toast.success("Team member updated");
      } else {
        // Create new member
        const maxOrder = teamMembers.length > 0
          ? Math.max(...teamMembers.map((m) => m.display_order))
          : -1;

        const { data: newMember, error } = await supabase
          .from("team_members")
          .insert({
            name: data.name,
            role: data.role,
            bio: data.bio || null,
            email: data.email || null,
            phone: data.phone || null,
            social_facebook: data.social_facebook || null,
            social_twitter: data.social_twitter || null,
            social_instagram: data.social_instagram || null,
            social_linkedin: data.social_linkedin || null,
            is_active: data.is_active,
            display_order: maxOrder + 1,
          })
          .select()
          .single();

        if (error) throw error;

        // Upload photo if provided
        if (photoFile && newMember) {
          const photoUrl = await uploadPhoto(newMember.id);
          if (photoUrl) {
            await supabase
              .from("team_members")
              .update({ photo_url: photoUrl })
              .eq("id", newMember.id);
          }
        }

        toast.success("Team member created");
      }

      setDialogOpen(false);
      fetchTeamMembers();
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Failed to save team member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;

    try {
      // Delete photo from storage if exists
      if (memberToDelete.photo_url) {
        const fileName = memberToDelete.photo_url.split("/").pop();
        if (fileName) {
          await supabase.storage.from("team-photos").remove([fileName]);
        }
      }

      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberToDelete.id);

      if (error) throw error;

      toast.success("Team member deleted");
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      fetchTeamMembers();
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    }
  };

  const toggleActive = async (member: TeamMember) => {
    const { error } = await supabase
      .from("team_members")
      .update({ is_active: !member.is_active })
      .eq("id", member.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(member.is_active ? "Team member hidden" : "Team member visible");
      fetchTeamMembers();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-muted-foreground">
            Manage your team members displayed on the website
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {teamMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No team members yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first team member to get started
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id} className={!member.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={member.photo_url || undefined} alt={member.name} />
                      <AvatarFallback className="text-lg">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={member.is_active ? "default" : "secondary"}>
                    {member.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {member.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {member.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {member.email && (
                    <Badge variant="outline" className="gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </Badge>
                  )}
                  {member.phone && (
                    <Badge variant="outline" className="gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </Badge>
                  )}
                  {member.social_facebook && (
                    <Badge variant="outline" className="gap-1">
                      <Facebook className="h-3 w-3" />
                    </Badge>
                  )}
                  {member.social_twitter && (
                    <Badge variant="outline" className="gap-1">
                      <Twitter className="h-3 w-3" />
                    </Badge>
                  )}
                  {member.social_instagram && (
                    <Badge variant="outline" className="gap-1">
                      <Instagram className="h-3 w-3" />
                    </Badge>
                  )}
                  {member.social_linkedin && (
                    <Badge variant="outline" className="gap-1">
                      <Linkedin className="h-3 w-3" />
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={member.is_active}
                      onCheckedChange={() => toggleActive(member)}
                    />
                    <span className="text-sm text-muted-foreground">Visible</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setMemberToDelete(member);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMember ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
            <DialogDescription>
              {selectedMember
                ? "Update the team member's information"
                : "Add a new team member to display on your website"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={photoPreview || undefined} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Upload className="h-4 w-4" />
                      {photoPreview ? "Change Photo" : "Upload Photo"}
                    </div>
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 5MB, JPG or PNG
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <FormControl>
                        <Input placeholder="Creative Director" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description about this team member..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="john@example.com" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="+233 XX XXX XXXX" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <Label>Social Links</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="social_facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Facebook URL" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="social_twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Twitter URL" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="social_instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Instagram URL" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="social_linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="LinkedIn URL" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Show this team member on the website
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || uploading}>
                  {(saving || uploading) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {selectedMember ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {memberToDelete?.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
