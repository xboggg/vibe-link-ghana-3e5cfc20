import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CTASection } from "@/components/sections/CTASection";
import { ArrowLeft, Clock, Calendar, Share2, Facebook, Twitter, Loader2, Tag } from "lucide-react";
import SEO, { createArticleSchema, createBreadcrumbSchema } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import DOMPurify from "dompurify";

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
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    setLoading(true);
    try {
      // Fetch the main post
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('published', true)
        .single();

      if (error) throw error;
      setPost(data);

      // Fetch related posts from the same category
      if (data) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(3);

        setRelatedPosts(related || []);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href;
    const title = post?.title || '';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="pt-24 lg:pt-32 pb-16 min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </section>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <SEO 
          title="Article Not Found"
          description="The article you're looking for doesn't exist or has been removed."
          noindex={true}
        />
        <section className="pt-24 lg:pt-32 pb-16 min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Article not found
            </h1>
            <p className="text-muted-foreground mb-8">
              This article doesn't exist or is coming soon.
            </p>
            <Button asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  // Use meta_description if available, fallback to excerpt
  const seoDescription = post.meta_description || post.excerpt;
  
  // Build keywords from focus_keyword, category, and tags
  const keywordParts = [
    post.focus_keyword,
    post.category,
    ...(post.tags || []),
    'Ghana events',
    'VibeLink blog'
  ].filter(Boolean);
  const seoKeywords = keywordParts.join(', ');

  // Create article schema for this blog post
  const articleSchema = createArticleSchema({
    title: post.title,
    description: seoDescription,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: post.author_name,
    image: post.image_url,
    url: `/blog/${slug}`,
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${slug}` },
  ]);

  return (
    <Layout>
      <ReadingProgressBar />
      <SEO
        title={post.title}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={`/blog/${slug}`}
        ogImage={post.image_url}
        ogType="article"
        jsonLd={[articleSchema, breadcrumbSchema]}
      />
      
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-8 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-secondary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              {post.category}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-primary-foreground/70">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.read_time}
              </span>
              <span className="text-primary-foreground/50">
                By {post.author_name}
              </span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map(tag => (
                  <Link 
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-xs hover:bg-primary-foreground/20 transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full rounded-2xl shadow-lg aspect-[16/9] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg max-w-none dark:prose-invert"
            >
              {post.content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                  className="[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-foreground [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-foreground [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ul>li]:text-muted-foreground [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&>ol>li]:text-muted-foreground [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>a]:text-primary [&>a]:underline [&>img]:rounded-lg [&>img]:max-w-full"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 pt-8 border-t border-border"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Share this article</h3>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('facebook')}
                      className="flex items-center gap-2"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('twitter')}
                      className="flex items-center gap-2"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('copy')}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <motion.article
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group rounded-xl bg-card border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <Link to={`/blog/${relatedPost.slug}`}>
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={relatedPost.image_url}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {relatedPost.category}
                        </Badge>
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Clock className="h-3 w-3" />
                          {relatedPost.read_time}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </Layout>
  );
};

export default BlogDetail;
