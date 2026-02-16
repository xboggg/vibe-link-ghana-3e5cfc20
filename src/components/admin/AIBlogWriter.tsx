import { useState, useEffect } from "react";
import {
  Sparkles, FileText, Edit, Trash2, Eye, Save, Copy,
  Loader2, RefreshCw, Send, Clock, CheckCircle, Image,
  Tag, Calendar, Wand2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface BlogPost {
  id: string;
  content_type: string;
  title: string | null;
  content: string;
  prompt_used: string | null;
  metadata: any;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

type BlogTopic = "event_tips" | "wedding" | "birthday" | "corporate" | "diy" | "trends" | "behind_scenes" | "testimonial";

const topicConfig: Record<BlogTopic, { label: string; description: string; keywords: string[] }> = {
  event_tips: {
    label: "Event Planning Tips",
    description: "General event planning advice",
    keywords: ["planning", "checklist", "timeline", "budget"]
  },
  wedding: {
    label: "Wedding Ideas",
    description: "Wedding inspiration and tips",
    keywords: ["wedding", "bride", "groom", "ceremony", "reception"]
  },
  birthday: {
    label: "Birthday Celebrations",
    description: "Birthday party ideas",
    keywords: ["birthday", "celebration", "party", "cake", "decorations"]
  },
  corporate: {
    label: "Corporate Events",
    description: "Business event planning",
    keywords: ["corporate", "business", "conference", "seminar", "networking"]
  },
  diy: {
    label: "DIY Decorations",
    description: "Do-it-yourself tips",
    keywords: ["DIY", "craft", "handmade", "creative", "budget-friendly"]
  },
  trends: {
    label: "Event Trends",
    description: "Latest trends in events",
    keywords: ["trends", "2024", "modern", "popular", "innovative"]
  },
  behind_scenes: {
    label: "Behind the Scenes",
    description: "VibeLink stories",
    keywords: ["behind the scenes", "team", "process", "story"]
  },
  testimonial: {
    label: "Client Stories",
    description: "Customer success stories",
    keywords: ["testimonial", "success", "client", "review", "experience"]
  }
};

const blogTemplates: Record<BlogTopic, (vars: any) => { title: string; content: string }> = {
  event_tips: (vars) => ({
    title: `${vars.count || '10'} Essential Tips for Planning the Perfect ${vars.eventType || 'Event'} in Ghana`,
    content: `Planning an event in Ghana? Whether it's your first time organizing or you're a seasoned planner, these tips will help ensure your ${vars.eventType || 'event'} is a memorable success.

## 1. Start Early
Give yourself plenty of time to plan. For major events, start at least 3-6 months in advance.

## 2. Set a Realistic Budget
Know your limits and allocate funds wisely. Remember to include a contingency fund of 10-15%.

## 3. Choose the Right Venue
Consider factors like capacity, location, accessibility, and amenities. Visit the venue in person before booking.

## 4. Create a Detailed Timeline
Break down your planning into weekly or monthly tasks. Use a checklist to stay organized.

## 5. Hire Reliable Vendors
Work with trusted professionals. Read reviews and ask for recommendations from friends and family.

## 6. Consider the Weather
Ghana's climate varies. Plan accordingly and have backup options for outdoor events.

## 7. Focus on Guest Experience
Think about your guests' comfort - from seating arrangements to food preferences and entertainment.

## 8. Don't Forget the Details
Small touches like personalized name cards, quality decorations, and thoughtful favors make a big difference.

## 9. Prepare for the Unexpected
Have a Plan B for potential issues like power outages, weather changes, or vendor no-shows.

## 10. Enjoy the Moment
Remember to take a step back and enjoy your event. You've worked hard for this!

---

At VibeLink Event, we're here to help make your event dreams come true. Contact us today for professional event design services that will leave a lasting impression.

*Ready to start planning? [Get a quote](#) or [call us](#) today!*`
  }),

  wedding: (vars) => ({
    title: `${vars.theme || 'Beautiful'} Wedding Ideas: Creating Your Dream Ghanaian Wedding`,
    content: `Your wedding day is one of the most important days of your life. Here's how to make it unforgettable.

## Embracing Ghanaian Traditions
Incorporate traditional elements like kente cloth, traditional beads, and cultural ceremonies to honor your heritage while creating a beautiful celebration.

## Color Palette Inspiration
Popular wedding colors in Ghana include:
- Classic gold and white
- Elegant burgundy and gold
- Modern blush and greenery
- Traditional kente-inspired combinations

## Venue Selection
From beachside ceremonies in Cape Coast to elegant hotel ballrooms in Accra, Ghana offers stunning venues for every style and budget.

## Catering Considerations
Blend Ghanaian favorites like jollof rice, kelewele, and grilled tilapia with international options to satisfy all your guests.

## Photography & Videography
Capture every moment - from the getting ready shots to the last dance. Consider drone footage for outdoor venues.

## VibeLink Touch
Let us create stunning backdrops, table settings, and decorations that reflect your unique love story.

---

*Planning your wedding? Contact VibeLink Event for custom wedding design packages.*`
  }),

  birthday: (vars) => ({
    title: `How to Throw an Unforgettable ${vars.age ? vars.age + 'th' : ''} Birthday Party in Ghana`,
    content: `Whether it's a milestone birthday or an intimate celebration, here's how to make it special.

## Choose Your Theme
Popular birthday themes include:
- Tropical Paradise
- Elegant Black and Gold
- Vintage Glam
- Cultural Heritage
- Modern Minimalist

## The Perfect Venue
Options range from home parties and restaurants to outdoor gardens and event halls. Match your venue to your guest count and theme.

## Decorations That Wow
- Statement balloon installations
- Custom photo backdrops
- Themed table centerpieces
- Personalized banners and signage

## Entertainment Ideas
- Live DJ or band
- Photo booth with props
- Games and activities
- Surprise performers

## Food & Drink
Create a menu that suits your guests:
- Finger foods and appetizers
- Main course options
- Birthday cake (the centerpiece!)
- Refreshing drinks and cocktails

## Party Favors
Send guests home with memorable keepsakes that reflect your celebration.

---

*Let VibeLink Event design your dream birthday party! From intimate gatherings to grand celebrations, we've got you covered.*`
  }),

  corporate: (vars) => ({
    title: `Professional Event Planning: Making Your ${vars.eventType || 'Corporate Event'} Stand Out`,
    content: `Corporate events require a perfect balance of professionalism and engagement. Here's how to achieve it.

## Types of Corporate Events
- Conferences and seminars
- Product launches
- Team building events
- Award ceremonies
- Annual general meetings
- Networking events

## Key Success Factors

### Professional Branding
Incorporate your company's branding throughout the event - from signage to table settings.

### Technology Integration
Ensure reliable AV equipment, strong WiFi, and consider live streaming for remote participants.

### Catering Excellence
Offer quality refreshments that keep attendees energized and focused.

### Comfortable Environment
Consider seating arrangements, temperature control, and accessibility for all attendees.

## Making It Memorable
- Custom branded materials
- Interactive sessions
- Professional photography
- Meaningful takeaways

---

*Elevate your corporate events with VibeLink Event's professional design services.*`
  }),

  diy: (vars) => ({
    title: `Budget-Friendly DIY Decoration Ideas for Your ${vars.eventType || 'Event'}`,
    content: `Create stunning event decorations without breaking the bank with these creative DIY ideas.

## Paper Decorations
- Tissue paper pom-poms
- Paper lanterns
- Origami garlands
- Confetti poppers

## Balloon Magic
- Balloon arches (easier than you think!)
- Balloon centerpieces
- Number and letter balloons

## Natural Elements
- Fresh flower arrangements
- Potted plants as centerpieces
- Bamboo and wood accents
- Leaf garlands

## Lighting Effects
- String lights
- Candles in mason jars
- Paper bag luminaries
- Fairy light curtains

## Photo Backdrop Ideas
- Fabric draping
- Paper flower wall
- Balloon wall
- Fringe curtain

## Tips for Success
1. Start collecting materials early
2. Do a test run before the event
3. Get friends and family to help
4. Have backup supplies

---

*Need professional help? VibeLink Event offers affordable decoration packages for any budget.*`
  }),

  trends: (vars) => ({
    title: `Top Event Trends for ${vars.year || '2024'}: What's Hot in Ghana`,
    content: `Stay ahead of the curve with these trending event ideas taking Ghana by storm.

## Sustainable Events
- Eco-friendly decorations
- Digital invitations
- Reusable tableware
- Local and seasonal flowers

## Technology Integration
- Virtual components for hybrid events
- QR codes for digital programs
- Social media walls
- LED and projection mapping

## Intimate Celebrations
- Micro-weddings and events
- Focus on quality over quantity
- Personalized guest experiences
- Exclusive venues

## Bold Color Palettes
Moving beyond pastels:
- Rich jewel tones
- Earth tones with gold accents
- Monochromatic schemes
- Unexpected color combinations

## Interactive Elements
- DIY stations
- Food and drink bars
- Photo experiences
- Live entertainment

## Personalization
- Custom signage
- Monogrammed details
- Personalized favors
- Curated playlists

---

*Stay trendy with VibeLink Event - your partner for modern, stylish events.*`
  }),

  behind_scenes: (vars) => ({
    title: `Behind the Scenes: How VibeLink Event Creates Magical Events`,
    content: `Ever wondered what goes into creating those stunning event setups? Here's a peek behind the curtain.

## Our Process

### 1. Consultation
We start by understanding your vision, preferences, and budget. Every detail matters.

### 2. Concept Development
Our creative team develops unique concepts tailored to your event.

### 3. Planning & Sourcing
We source the best materials and coordinate with trusted vendors.

### 4. Preparation
Days before your event, we prepare decorations, test setups, and finalize details.

### 5. Setup Day
Our team arrives early to transform your venue into something magical.

### 6. The Event
We ensure everything runs smoothly and looks perfect throughout.

## Meet Our Team
Our dedicated team of designers, coordinators, and setup specialists work together to bring your vision to life.

## Why We Love What We Do
There's nothing quite like seeing our clients' faces light up when they see their transformed venue for the first time.

---

*Join the VibeLink family - let us create magic for your next event.*`
  }),

  testimonial: (vars) => ({
    title: `Client Spotlight: ${vars.clientName || 'A Beautiful'} ${vars.eventType || 'Celebration'} with VibeLink Event`,
    content: `We're thrilled to share another successful event story with you!

## The Vision
${vars.clientName || 'Our client'} came to us with a dream of creating a ${vars.eventType || 'memorable event'} that would leave guests in awe.

## The Challenge
${vars.challenge || 'Creating a unique and personalized experience within budget and timeline constraints.'}

## Our Approach
We worked closely with ${vars.clientName || 'our client'} to understand every detail of their vision. From color schemes to flower choices, no detail was too small.

## The Result
The event was a stunning success! ${vars.quote || '"VibeLink Event exceeded our expectations. The decorations were absolutely beautiful and our guests couldn\'t stop talking about them."'}

## Highlights
- Custom ${vars.highlight1 || 'backdrop design'}
- Elegant ${vars.highlight2 || 'table arrangements'}
- Beautiful ${vars.highlight3 || 'entrance setup'}

---

*Your story could be next! Contact VibeLink Event to start planning your perfect event.*`
  })
};

export function AIBlogWriter() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<BlogTopic>("event_tips");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    eventType: "",
    theme: "",
    year: new Date().getFullYear().toString(),
    clientName: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_generated_content")
        .select("*")
        .eq("content_type", "blog_post")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePost = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const template = blogTemplates[selectedTopic];
      const generated = template({
        eventType: formData.eventType || undefined,
        theme: formData.theme || undefined,
        year: formData.year || undefined,
        clientName: formData.clientName || undefined,
      });

      setFormData({
        ...formData,
        title: generated.title,
        content: generated.content
      });
      setIsGenerating(false);
    }, 800);
  };

  const savePost = async (status: string = "draft") => {
    if (!formData.title || !formData.content) {
      toast.error("Please generate or write content first");
      return;
    }

    try {
      const postData = {
        content_type: "blog_post",
        title: formData.title,
        content: formData.content,
        prompt_used: JSON.stringify({ topic: selectedTopic, variables: formData }),
        metadata: {
          topic: selectedTopic,
          eventType: formData.eventType,
          keywords: topicConfig[selectedTopic].keywords
        },
        status
      };

      if (selectedPost) {
        await supabase.from("ai_generated_content").update(postData).eq("id", selectedPost.id);
        toast.success("Post updated!");
      } else {
        await supabase.from("ai_generated_content").insert(postData);
        toast.success("Post saved!");
      }

      setIsEditorOpen(false);
      resetForm();
      fetchPosts();
    } catch (err) {
      toast.error("Failed to save post");
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await supabase.from("ai_generated_content").delete().eq("id", id);
      toast.success("Post deleted");
      fetchPosts();
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const editPost = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title || "",
      content: post.content,
      eventType: post.metadata?.eventType || "",
      theme: "",
      year: new Date().getFullYear().toString(),
      clientName: ""
    });
    setSelectedTopic(post.metadata?.topic || "event_tips");
    setIsEditorOpen(true);
  };

  const resetForm = () => {
    setSelectedPost(null);
    setFormData({
      title: "",
      content: "",
      eventType: "",
      theme: "",
      year: new Date().getFullYear().toString(),
      clientName: ""
    });
  };

  const copyToClipboard = () => {
    const text = `# ${formData.title}\n\n${formData.content}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === "approved" || status === "published") {
        updates.approved_by = "Admin";
        updates.approved_at = new Date().toISOString();
      }
      await supabase.from("ai_generated_content").update(updates).eq("id", id);
      toast.success(`Status updated to ${status}`);
      fetchPosts();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500",
    approved: "bg-blue-500",
    published: "bg-green-500",
    rejected: "bg-red-500"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Blog Writer
          </h2>
          <p className="text-muted-foreground">Generate engaging blog content for your website</p>
        </div>
        <Button onClick={() => { resetForm(); setIsEditorOpen(true); }}>
          <Wand2 className="h-4 w-4 mr-2" />
          Create New Post
        </Button>
      </div>

      {/* Topic Quick Select */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.entries(topicConfig) as [BlogTopic, typeof topicConfig[BlogTopic]][]).slice(0, 4).map(([topic, config]) => (
          <Card
            key={topic}
            className="cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => { setSelectedTopic(topic); resetForm(); setIsEditorOpen(true); }}
          >
            <CardContent className="p-4">
              <p className="font-medium text-sm">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No blog posts yet</p>
              <Button className="mt-4" onClick={() => setIsEditorOpen(true)}>
                <Wand2 className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {post.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {topicConfig[post.metadata?.topic as BlogTopic]?.label || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[post.status] || 'bg-gray-500'}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => editPost(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {post.status === "draft" && (
                          <Button variant="ghost" size="sm" onClick={() => updateStatus(post.id, "approved")}>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        {post.status === "approved" && (
                          <Button variant="ghost" size="sm" onClick={() => updateStatus(post.id, "published")}>
                            <Send className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deletePost(post.id)}>
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

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {selectedPost ? "Edit Blog Post" : "Create Blog Post"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <Label>Blog Topic</Label>
                <Select value={selectedTopic} onValueChange={(v) => setSelectedTopic(v as BlogTopic)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(topicConfig).map(([topic, config]) => (
                      <SelectItem key={topic} value={topic}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Event Type (optional)</Label>
                <Input
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  placeholder="e.g., Wedding, Birthday"
                />
              </div>

              <div>
                <Label>Theme (optional)</Label>
                <Input
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="e.g., Rustic, Modern"
                />
              </div>

              {selectedTopic === "testimonial" && (
                <div>
                  <Label>Client Name</Label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Client's name"
                  />
                </div>
              )}

              <Button onClick={generatePost} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Generate Content
              </Button>

              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Suggested Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {topicConfig[selectedTopic].keywords.map(kw => (
                    <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Blog post title..."
                />
              </div>

              <div>
                <Label>Content (Markdown)</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Blog content will appear here..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="secondary" onClick={() => savePost("draft")}>
              <Clock className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => savePost("approved")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AIBlogWriter;

