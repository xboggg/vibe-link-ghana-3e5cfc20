import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all posts that are scheduled to be published and the scheduled time has passed
    const now = new Date().toISOString();
    
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, scheduled_publish_at')
      .eq('published', false)
      .not('scheduled_publish_at', 'is', null)
      .lte('scheduled_publish_at', now);

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError);
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('No scheduled posts to publish');
      return new Response(
        JSON.stringify({ message: 'No scheduled posts to publish', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${scheduledPosts.length} posts to publish`);

    // Publish each scheduled post
    const publishResults = await Promise.all(
      scheduledPosts.map(async (post) => {
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({
            published: true,
            published_at: post.scheduled_publish_at,
            scheduled_publish_at: null
          })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Error publishing post ${post.id}:`, updateError);
          return { id: post.id, title: post.title, success: false, error: updateError.message };
        }

        console.log(`Published post: ${post.title}`);
        return { id: post.id, title: post.title, success: true };
      })
    );

    const successCount = publishResults.filter(r => r.success).length;
    const failedCount = publishResults.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Published ${successCount} posts, ${failedCount} failed`,
        results: publishResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in publish-scheduled-posts:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
