import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all posts that are scheduled to be published and the scheduled time has passed
    const now = new Date().toISOString();
    
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, author_name, scheduled_publish_at')
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

    // Fetch admin emails for notifications
    let adminEmails: string[] = [];
    if (resendApiKey) {
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminUsers && adminUsers.length > 0) {
        const userIds = adminUsers.map(u => u.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email')
          .in('id', userIds);

        adminEmails = profiles?.map(p => p.email).filter(Boolean) as string[] || [];
      }
    }

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

        // Send email notification to admins
        if (resendApiKey && adminEmails.length > 0) {
          try {
            const resend = new Resend(resendApiKey);
            await resend.emails.send({
              from: 'VibeLink Blog <onboarding@resend.dev>',
              to: adminEmails,
              subject: `📝 Blog Post Published: ${post.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #6B46C1;">Blog Post Auto-Published</h2>
                  <p>The following scheduled blog post has been automatically published:</p>
                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">${post.title}</h3>
                    <p style="margin: 0; color: #666;">By ${post.author_name}</p>
                  </div>
                  <p>
                    <a href="https://vibelink.com.gh/blog/${post.slug}" 
                       style="display: inline-block; background: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                      View Post
                    </a>
                  </p>
                  <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    This is an automated notification from VibeLink Blog.
                  </p>
                </div>
              `,
            });
            console.log(`Notification email sent for: ${post.title}`);
          } catch (emailError) {
            console.error('Error sending notification email:', emailError);
          }
        }

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
