import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CTASection } from "@/components/sections/CTASection";
import { Clock, ArrowRight, BookOpen, Search, X, ChevronDown, Loader2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const POSTS_PER_LOAD = 6;

const categories = [
  "All",
  "Wedding",
  "Funeral & Memorial",
  "Anniversaries",
  "Church",
  "Community",
  "Ghanaian Culture",
  "Event Planning",
  "Naming Ceremonies",
  "Inspirations",
  "Tips & Guides"
];

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string;
  read_time: string;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  tags: string[];
}

// Keep for backwards compatibility - will be used as fallback
export const blogPosts = [
  {
    id: 1,
    slug: "complete-guide-ghanaian-wedding-traditions",
    title: "The Complete Guide to Ghanaian Wedding Traditions",
    excerpt: "From the knocking ceremony to the white wedding, discover the rich traditions that make Ghanaian weddings unique and unforgettable.",
    category: "Traditions",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    readTime: "8 min read",
    date: "December 15, 2024",
    featured: true,
  },
  {
    id: 2,
    slug: "planning-funeral-ghana-what-to-know",
    title: "Planning a Funeral in Ghana: What You Need to Know",
    excerpt: "A respectful guide to funeral planning in Ghana, including customs, timelines, and how to coordinate with family near and far.",
    category: "Event Planning",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80",
    readTime: "10 min read",
    date: "December 10, 2024",
    featured: true,
  },
];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_LOAD);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, category, image_url, read_time, featured, published_at, created_at, tags')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags from posts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      (post.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          (post.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (activeCategory !== "All") {
      filtered = filtered.filter((post) => post.category === activeCategory);
    }

    // Filter by tag
    if (activeTag) {
      filtered = filtered.filter((post) => (post.tags || []).includes(activeTag));
    }
    
    return filtered;
  }, [posts, searchQuery, activeCategory, activeTag]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(POSTS_PER_LOAD);
  }, [searchQuery, activeCategory, activeTag]);

  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const featuredPosts = posts.filter((post) => post.featured);
  const hasMorePosts = visibleCount < filteredPosts.length;
  const remainingPosts = filteredPosts.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + POSTS_PER_LOAD);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  return (
    <Layout>
      <SEO 
        title="Blog"
        description="Tips, guides and inspiration for planning your Ghanaian wedding, funeral, naming ceremony and more. Learn about traditions and modern event planning."
        keywords="Ghana event planning blog, wedding traditions Ghana, funeral planning tips, naming ceremony guide"
        canonical="/blog"
      />
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Resources
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Event Planning Resources
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              Tips, guides, and inspiration for planning beautiful Ghanaian
              ceremonies and celebrations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {loading ? (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </section>
      ) : featuredPosts.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {featuredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-xl md:rounded-2xl overflow-hidden"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-[4/3] md:aspect-[16/9] overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
                  <span className="absolute top-3 left-3 md:top-4 md:left-4 inline-block px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] md:text-xs font-medium">
                    {post.category}
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                    <h3 className="text-base md:text-xl lg:text-2xl font-bold text-primary-foreground mb-1 md:mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-primary-foreground/70 text-xs md:text-sm line-clamp-2 mb-2 md:mb-3 hidden sm:block">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 md:gap-4 text-primary-foreground/60 text-[10px] md:text-sm">
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.read_time}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      )}
      {/* Search & Filter */}
      <section className="py-8 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setActiveTag(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 items-center">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activeTag === tag
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear tag
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* All Posts Grid */}
      <section id="articles-section" className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {activeCategory === "All" ? "All Articles" : activeCategory}
            </h2>
            <span className="text-muted-foreground text-sm">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                  setActiveTag(null);
                }}
                className="mt-4 text-primary font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {visiblePosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group rounded-xl md:rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 md:p-5">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                          <span className="px-2 py-0.5 md:py-1 rounded bg-muted text-muted-foreground text-[10px] md:text-xs font-medium">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground text-[10px] md:text-xs">
                            <Clock className="h-3 w-3" />
                            {post.read_time}
                          </span>
                        </div>
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.tags.slice(0, 3).map(tag => (
                              <span 
                                key={tag}
                                className="px-1.5 py-0.5 rounded-sm bg-secondary/10 text-secondary text-[9px] md:text-[10px]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <h3 className="text-base md:text-lg font-bold text-foreground mb-1.5 md:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 mb-3 md:mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-[10px] md:text-xs">
                            {formatDate(post.published_at || post.created_at)}
                          </span>
                          <span className="text-primary text-xs md:text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read more
                            <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>

              {/* Load More Button */}
              {hasMorePosts && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-10 text-center"
                >
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    className="px-8 gap-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Load More ({remainingPosts} remaining)
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Want More Event Planning Tips?
            </h2>
            <p className="text-muted-foreground mb-6">
              Follow us on social media for daily inspiration and tips for
              planning your perfect Ghanaian celebration.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://instagram.com/vibelink_ghana"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Follow on Instagram
              </a>
              <a
                href="https://facebook.com/VibeLink Ghana"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-card border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                Follow on Facebook
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default Blog;
