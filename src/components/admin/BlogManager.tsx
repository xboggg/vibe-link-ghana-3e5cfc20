import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, Pencil, Trash2, Eye, EyeOff, Star, RefreshCw, 
  Calendar, Clock, ExternalLink, Search, Upload, Image, Tag, X
} from 'lucide-react';
import { format } from 'date-fns';
import { RichTextEditor } from './RichTextEditor';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  read_time: string;
  featured: boolean;
  published: boolean;
  author_name: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  tags: string[];
  scheduled_publish_at: string | null;
}

const categories = [
  'Wedding',
  'Funeral & Memorial',
  'Anniversaries',
  'Church',
  'Community',
  'Ghanaian Culture',
  'Event Planning',
  'Naming Ceremonies',
  'Inspirations',
  'Tips & Guides'
];

const suggestedTags = [
  'Ghanaian Weddings',
  'Traditional Ceremonies',
  'Event Design',
  'Funeral Programs',
  'Church Events',
  'Anniversary Ideas',
  'Naming Ceremony',
  'Kente',
  'DIY Tips',
  'Budget Friendly',
  'Luxury Events',
  'Cultural Heritage'
];

const emptyPost: Partial<BlogPost> = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Tips & Guides',
  image_url: '',
  read_time: '5 min read',
  featured: false,
  published: false,
  author_name: 'JC Creative Studios',
  meta_description: '',
  focus_keyword: '',
  tags: [],
  scheduled_publish_at: null
};

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setEditingPost(prev => ({
      ...prev,
      title,
      slug: prev?.slug || generateSlug(title)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setEditingPost(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!editingPost?.title || !editingPost?.excerpt || !editingPost?.image_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: editingPost.title!,
        excerpt: editingPost.excerpt!,
        content: editingPost.content || '',
        category: editingPost.category!,
        image_url: editingPost.image_url!,
        read_time: editingPost.read_time || '5 min read',
        featured: editingPost.featured || false,
        published: editingPost.published || false,
        author_name: editingPost.author_name || 'JC Creative Studios',
        slug: editingPost.slug || generateSlug(editingPost.title!),
        published_at: editingPost.published ? (editingPost.published_at || new Date().toISOString()) : null,
        meta_description: editingPost.meta_description || null,
        focus_keyword: editingPost.focus_keyword || null,
        tags: editingPost.tags || [],
        scheduled_publish_at: !editingPost.published && editingPost.scheduled_publish_at ? editingPost.scheduled_publish_at : null
      };

      if (editingPost.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast.success('Post updated successfully');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (error) throw error;
        toast.success('Post created successfully');
      }

      setIsDialogOpen(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast.error(error.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          published: !post.published,
          published_at: !post.published ? new Date().toISOString() : post.published_at
        })
        .eq('id', post.id);

      if (error) throw error;
      toast.success(post.published ? 'Post unpublished' : 'Post published');
      fetchPosts();
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Failed to update post');
    }
  };

  const toggleFeatured = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ featured: !post.featured })
        .eq('id', post.id);

      if (error) throw error;
      toast.success(post.featured ? 'Removed from featured' : 'Added to featured');
      fetchPosts();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update post');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && post.published) ||
                         (filterStatus === 'draft' && !post.published);
    return matchesSearch && matchesStatus;
  });

  const openEditDialog = (post?: BlogPost) => {
    setEditingPost(post || { ...emptyPost });
    setIsDialogOpen(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Blog Manager</h2>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEditDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost?.id ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={editingPost?.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title..."
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input
                  value={editingPost?.slug || ''}
                  onChange={(e) => setEditingPost(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                />
                <p className="text-xs text-muted-foreground">/blog/{editingPost?.slug || 'your-post-slug'}</p>
              </div>

              {/* Category & Read Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={editingPost?.category || 'Tips & Guides'}
                    onValueChange={(value) => setEditingPost(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Read Time</Label>
                  <Input
                    value={editingPost?.read_time || '5 min read'}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, read_time: e.target.value }))}
                    placeholder="5 min read"
                  />
                </div>
              </div>

              {/* Featured Image Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Featured Image *
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={editingPost?.image_url || ''}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="Image URL or upload below..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {editingPost?.image_url && (
                  <img 
                    src={editingPost.image_url} 
                    alt="Preview" 
                    className="mt-2 rounded-lg max-h-40 object-cover"
                  />
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label>Excerpt *</Label>
                <Textarea
                  value={editingPost?.excerpt || ''}
                  onChange={(e) => setEditingPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of the post..."
                  rows={2}
                />
              </div>

              {/* Content - Rich Text Editor */}
              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  content={editingPost?.content || ''}
                  onChange={(content) => {
                    // Calculate reading time based on word count
                    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                    const wordCount = textContent.split(' ').filter(Boolean).length;
                    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
                    const readTimeStr = `${readingTime} min read`;
                    
                    setEditingPost(prev => ({ 
                      ...prev, 
                      content,
                      read_time: readTimeStr
                    }));
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Estimated reading time: {editingPost?.read_time || '0 min read'} (auto-calculated)
                </p>
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(editingPost?.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = [...(editingPost?.tags || [])];
                          newTags.splice(index, 1);
                          setEditingPost(prev => ({ ...prev, tags: newTags }));
                        }}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        if (!editingPost?.tags?.includes(tagInput.trim())) {
                          setEditingPost(prev => ({
                            ...prev,
                            tags: [...(prev?.tags || []), tagInput.trim()]
                          }));
                        }
                        setTagInput('');
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (tagInput.trim() && !editingPost?.tags?.includes(tagInput.trim())) {
                        setEditingPost(prev => ({
                          ...prev,
                          tags: [...(prev?.tags || []), tagInput.trim()]
                        }));
                        setTagInput('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs text-muted-foreground mr-1">Suggestions:</span>
                  {suggestedTags.filter(t => !editingPost?.tags?.includes(t)).slice(0, 6).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setEditingPost(prev => ({
                          ...prev,
                          tags: [...(prev?.tags || []), tag]
                        }));
                      }}
                      className="text-xs px-2 py-0.5 bg-muted rounded hover:bg-muted/80 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEO Section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  SEO Settings
                </h4>
                <div className="space-y-2">
                  <Label>Focus Keyword</Label>
                  <Input
                    value={editingPost?.focus_keyword || ''}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, focus_keyword: e.target.value }))}
                    placeholder="e.g., Ghanaian wedding programs"
                  />
                  <p className="text-xs text-muted-foreground">
                    The main keyword you want this post to rank for
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={editingPost?.meta_description || ''}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="A brief description for search engines (max 160 characters)..."
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(editingPost?.meta_description || '').length}/160 characters
                  </p>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPost?.published || false}
                    onCheckedChange={(checked) => {
                      setEditingPost(prev => ({ 
                        ...prev, 
                        published: checked,
                        scheduled_publish_at: checked ? null : prev?.scheduled_publish_at
                      }));
                    }}
                  />
                  <Label>Publish immediately</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPost?.featured || false}
                    onCheckedChange={(checked) => setEditingPost(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label>Featured post</Label>
                </div>
              </div>

              {/* Scheduled Publishing */}
              {!editingPost?.published && (
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 border">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule for Later
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Set a date and time for this post to be automatically published
                  </p>
                  <Input
                    type="datetime-local"
                    value={editingPost?.scheduled_publish_at 
                      ? new Date(editingPost.scheduled_publish_at).toISOString().slice(0, 16) 
                      : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingPost(prev => ({ 
                        ...prev, 
                        scheduled_publish_at: value ? new Date(value).toISOString() : null 
                      }));
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {editingPost?.scheduled_publish_at && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-primary">
                        Will be published on {format(new Date(editingPost.scheduled_publish_at), 'MMMM d, yyyy \'at\' h:mm a')}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPost(prev => ({ ...prev, scheduled_publish_at: null }))}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingPost?.id ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{posts.length}</div>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{posts.filter(p => p.published).length}</div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{posts.filter(p => p.scheduled_publish_at && !p.published).length}</div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{posts.filter(p => p.featured).length}</div>
            <p className="text-sm text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchPosts}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No blog posts found</p>
              <Button variant="outline" className="mt-4" onClick={() => openEditDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first post
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <CardContent className="flex-1 p-4">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                    {post.scheduled_publish_at && !post.published && (
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Scheduled: {format(new Date(post.scheduled_publish_at), 'MMM d, h:mm a')}
                      </Badge>
                    )}
                    <Badge variant="outline">{post.category}</Badge>
                    {post.featured && (
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.read_time}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(post)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => togglePublish(post)}
                    >
                      {post.published ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleFeatured(post)}
                    >
                      <Star className={`h-3 w-3 mr-1 ${post.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      {post.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      asChild
                    >
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
