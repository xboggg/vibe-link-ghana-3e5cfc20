import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { ArrowLeft, Clock, Calendar, Share2, Facebook, Twitter } from "lucide-react";
import { blogPosts } from "./Blog";
import SEO from "@/components/SEO";

const blogContent: Record<string, {
  content: string[];
  tips?: string[];
}> = {
  "complete-guide-ghanaian-wedding-traditions": {
    content: [
      "Ghanaian weddings are a beautiful celebration of love, family, and cultural heritage. Unlike Western weddings that focus primarily on a single ceremony, Ghanaian weddings often span multiple events, each with its own significance and traditions.",
      "## The Knocking Ceremony (Kokooko)",
      "The journey to marriage traditionally begins with the 'knocking' ceremony, known as 'Kokooko' in Akan. This is when the groom's family formally approaches the bride's family to declare their son's intention to marry their daughter. The groom's family brings drinks (usually schnapps) and sometimes money as a gesture of respect.",
      "This ceremony is deeply symbolic – it represents the groom's family 'knocking on the door' of the bride's family. It's typically a small, intimate gathering with close family members from both sides.",
      "## The Traditional Engagement",
      "Following the knocking ceremony, the engagement (or 'traditional wedding') is the most significant customary rite. This elaborate ceremony involves the official union of both families and the formal marriage according to traditional customs.",
      "During this ceremony, the bride price (or 'dowry') is presented and negotiated. This includes items like kente cloth, jewelry, drinks, money, and other gifts. The specific items vary by ethnic group and family traditions.",
      "The bride is often dressed in stunning kente and adorned with traditional gold jewelry, while the groom typically wears matching kente cloth. Both families showcase their heritage and status through elaborate displays.",
      "## The White Wedding",
      "Many Ghanaian couples also have a 'white wedding' – a church or civil ceremony often held on a different day from the traditional ceremony. This Western-style wedding has become an important part of Ghanaian wedding culture, especially among Christian families.",
      "The white wedding typically follows Western conventions with the bride in a white gown and the groom in a suit or tuxedo. It's often a larger, more public celebration compared to the traditional ceremony.",
      "## The Reception",
      "Whether following the traditional or white wedding (or both), the reception is where the real celebration happens. Expect lively music, incredible food (jollof rice is a must!), dancing, and lots of joy. Ghanaian receptions are known for their energy and can last well into the night.",
      "## Modern Touches",
      "Today's Ghanaian weddings beautifully blend tradition with modern elements. Digital invitations are becoming increasingly popular, allowing couples to share their celebration with family members across the globe. Features like RSVP tracking and mobile money collection make coordination easier for everyone involved.",
    ],
    tips: [
      "Start planning at least 6 months in advance for multi-ceremony weddings",
      "Involve family elders in negotiating and planning traditional aspects",
      "Consider digital invitations to easily update diaspora family members",
      "Use mobile money collection for convenient gift-giving from guests abroad",
      "Document all ceremonies – you'll want to remember every beautiful moment",
    ],
  },
  "planning-funeral-ghana-what-to-know": {
    content: [
      "Funerals in Ghana are profound celebrations of life, serving as both a mourning period and a tribute to the deceased. Understanding the customs and logistics can help families plan a meaningful farewell that honors their loved one.",
      "## The Importance of Funerals in Ghanaian Culture",
      "In Ghana, funerals are among the most significant social events. They bring communities together and provide closure for families. A well-organized funeral is seen as the final act of love and respect for the deceased.",
      "Funerals can be elaborate affairs, sometimes lasting several days, with distinct ceremonies for wake-keeping, burial, and thanksgiving. The scale often reflects the deceased's status and the family's wishes.",
      "## One-Week Observation",
      "Immediately after death, families observe a one-week mourning period. During this time, family members gather to support each other, and a formal announcement is made about the funeral arrangements.",
      "This period allows time for diaspora family members to make travel arrangements and for the family to coordinate the various aspects of the funeral.",
      "## Pre-Burial Rites",
      "Before the burial, there's typically a laying-in-state ceremony where the body is displayed for final viewing. This may take place at the family home or a funeral facility. Many families also hold a wake-keeping (night vigil) with prayers, hymns, and remembrances.",
      "## The Funeral Service",
      "The main funeral service usually takes place in a church for Christian families, though customs vary by religion and ethnic group. The service includes tributes, prayers, and often features a choir. After the service, the body is taken to the cemetery for burial.",
      "## Final Funeral Rites and Thanksgiving",
      "Following the burial, families often hold final rites and a thanksgiving service, typically on the Sunday after the burial. This marks the end of the formal mourning period and celebrates the deceased's life with food, music, and dancing.",
      "## Coordinating with Extended Family",
      "One of the biggest challenges in planning a Ghanaian funeral is coordinating with extended family, especially those living abroad. This is where digital tools become invaluable – sharing updates, collecting contributions, and managing RSVPs through a single link makes the process much smoother.",
    ],
    tips: [
      "Appoint a family coordinator to manage communications and logistics",
      "Create a digital tribute page to share updates with diaspora family",
      "Use mobile money collection to track and acknowledge donations transparently",
      "Plan for the burial location early – cemetery arrangements take time",
      "Consider live streaming the service for family members who cannot attend",
    ],
  },
  "naming-ceremony-traditions-ghana": {
    content: [
      "The naming ceremony, known as 'outdooring' in many Ghanaian cultures, is a beautiful tradition that welcomes a newborn into the family and community. Each ethnic group has its own unique customs, making these ceremonies a rich tapestry of Ghanaian heritage.",
      "## Akan Naming Traditions",
      "In Akan culture, children are named on the eighth day after birth. The ceremony is called 'din to' (naming). The child is given a 'kradin' (soul name) based on the day they were born, a family name, and often a Christian or Muslim name.",
      "Day names include Kwame/Ama (Saturday), Kofi/Afia (Friday), Kweku/Akua (Wednesday), and others. These names are believed to reflect certain personality traits associated with each day.",
      "## Ga Naming Traditions",
      "The Ga people hold their naming ceremony, called 'kpodziemo,' also on the eighth day. The ceremony typically takes place early in the morning. The child's feet are touched to the ground for the first time during this ceremony, symbolizing their introduction to the world.",
      "Water and liquor are used symbolically – the child is given tastes of each to teach them the difference between truth (water) and falsehood (liquor).",
      "## Ewe Naming Traditions",
      "Among the Ewe people, the naming ceremony (vi ŋkɔ naná) happens on the seventh day for boys and ninth day for girls. The ceremony involves prayers, libation, and the formal announcement of the child's name to the family and community.",
      "## Modern Naming Ceremonies",
      "Today's naming ceremonies often blend traditional elements with modern celebrations. Parents may hold the ceremony at home, in a garden, or at a venue. Digital invitations help share the joy with family around the world.",
    ],
    tips: [
      "Consult with family elders about traditional naming customs for your ethnic group",
      "Prepare traditional items needed for the ceremony in advance",
      "Create a beautiful digital invitation to share with all family members",
      "Document the ceremony with photos and videos for lasting memories",
      "Consider the meaning and significance of names before making final choices",
    ],
  },
  "digital-invitations-vs-paper-invitations": {
    content: [
      "The way we invite guests to celebrations is evolving. While traditional paper invitations hold sentimental value, more Ghanaian families are discovering the practical benefits of digital invitations. Let's explore why this shift is happening.",
      "## The Case for Digital Invitations",
      "Digital invitations offer several advantages that are particularly relevant for Ghanaian families: instant delivery to anyone in the world, easy updates if details change, built-in RSVP tracking, and significant cost savings.",
      "Consider a typical Ghanaian wedding that might invite 300+ guests. Printing and distributing physical invitations could cost thousands of cedis and take weeks. A digital invitation reaches everyone instantly at a fraction of the cost.",
      "## Reaching Diaspora Family",
      "Perhaps the biggest advantage is reaching family abroad. With Ghanaians spread across the UK, USA, Canada, and beyond, a digital invitation ensures everyone gets the same information at the same time. No more worrying about postal delays or lost mail.",
      "## Real-Time Updates",
      "Events change – venues get rescheduled, times adjust, new details emerge. With paper invitations, you're stuck with what you printed. Digital invitations can be updated instantly, and guests always see the latest information.",
      "## Interactive Features",
      "Modern digital invitations offer features paper simply can't match: embedded maps for directions, add-to-calendar buttons, RSVP forms, photo galleries, and even mobile money collection for contributions.",
      "## The Hybrid Approach",
      "Many families choose a hybrid approach – beautiful digital invitations for the majority of guests, with a few printed keepsakes for very close family members or those who prefer paper.",
    ],
    tips: [
      "Start with digital for efficiency, print selectively for sentiment",
      "Ensure your digital invitation is mobile-friendly – most Ghanaians browse on phones",
      "Use WhatsApp sharing features for maximum reach",
      "Include all essential details: date, time, venue, dress code, and contact person",
      "Add interactive elements like maps and RSVP buttons",
    ],
  },
  "coordinating-diaspora-family-events": {
    content: [
      "With millions of Ghanaians living abroad, coordinating family events requires thoughtful planning to ensure everyone feels included, regardless of distance. Here's how to bridge the gap.",
      "## Communication is Key",
      "Create a dedicated family WhatsApp group for the event. This becomes your central hub for updates, questions, and coordination. For larger events, consider appointing a diaspora coordinator in each major location (UK, USA, etc.) to relay information.",
      "## Time Zone Considerations",
      "When scheduling calls or live streams, consider your family's time zones. A 2 PM ceremony in Ghana is 6 AM in New York or 2 PM in London (GMT). Providing time zone conversions in your invitation helps everyone plan.",
      "## Digital Event Pages",
      "A dedicated digital invitation page serves as the single source of truth. Family abroad can access all details anytime – no need to scroll through WhatsApp messages. Include everything: schedule, venue directions, dress code, and contact numbers.",
      "## Live Streaming",
      "For family members who cannot travel, live streaming the ceremony is a thoughtful inclusion. Many venues offer this service, or you can set up a simple Facebook Live or YouTube stream. Just ensure stable internet!",
      "## Contribution Collection",
      "Mobile money makes it easy for diaspora family to contribute to events. They can send funds directly or through family members, with transparent tracking that ensures every contribution is acknowledged.",
    ],
    tips: [
      "Start communication early – diaspora family may need months to plan travel",
      "Create a single digital invitation with all essential information",
      "Provide clear time zone conversions for all scheduled events",
      "Set up mobile money collection for easy international contributions",
      "Consider recording ceremonies for those who miss the live stream",
    ],
  },
  "momo-contributions-modern-events": {
    content: [
      "Mobile money has revolutionized how Ghanaians handle financial transactions, and event contributions are no exception. Here's how MoMo is changing the landscape of wedding gifts and funeral donations.",
      "## The Traditional Way",
      "Traditionally, guests would bring cash gifts in envelopes to events, or family members would physically collect contributions. While personal, this method had challenges: accounting was difficult, contributors might be missed, and family abroad couldn't easily participate.",
      "## Enter Mobile Money",
      "Mobile money collection solves these problems elegantly. Guests can send contributions anytime, from anywhere in the world. Each transaction is recorded automatically, making acknowledgment and accounting straightforward.",
      "## Transparency and Trust",
      "One of the biggest benefits is transparency. Families can track every contribution in real-time, reducing the disputes that sometimes arose with cash handling. Contributors receive confirmation, and the family has a clear record for thank-you notes.",
      "## Diaspora Participation",
      "For family abroad, MoMo collection removes barriers to contributing. Instead of finding someone traveling to Ghana or navigating international transfers, they can simply send money from their phone – often through their own country's mobile money or international transfer services.",
      "## Integration with Invitations",
      "Modern digital invitations can include dedicated MoMo collection features, showing guests exactly how to contribute and allowing them to add personal messages. This integration creates a seamless experience from invitation to contribution.",
    ],
    tips: [
      "Set up a dedicated number for event contributions to keep personal finances separate",
      "Use a tracking system or dashboard to monitor contributions in real-time",
      "Acknowledge every contribution promptly – even a simple text goes a long way",
      "Provide clear instructions for those unfamiliar with mobile money",
      "Consider multiple payment options for diaspora family (MoMo, bank transfer, etc.)",
    ],
  },
  "traditional-engagement-ceremony-guide": {
    content: [
      "The traditional engagement, often called the 'knocking' or customary marriage, is one of the most important ceremonies in Ghanaian wedding traditions. Here's your complete guide to planning a beautiful traditional engagement.",
      "## Understanding the Purpose",
      "The traditional engagement formally unites two families. It's when the groom's family officially asks for the bride's hand, presents the bride price, and the families are joined according to customary law. In many ways, this is considered the 'real' marriage in traditional Ghanaian culture.",
      "## Preparing the List",
      "The bride's family will provide a 'list' of items required for the ceremony. This typically includes drinks (schnapps, wine), money, kente cloth, jewelry, toiletries, and other items. The list varies by ethnic group and family preferences. Negotiations may occur!",
      "## Choosing the Right Date",
      "Traditional beliefs often guide date selection. Consult with family elders about auspicious days according to your cultural practices. Saturday is the most popular day for these ceremonies.",
      "## Ceremony Flow",
      "The ceremony typically begins with the groom's family 'knocking' and being welcomed. There are formal greetings, prayers, and libation. The bride price is presented and accepted. Finally, the bride is officially presented to the groom's family.",
      "## Attire",
      "Both bride and groom typically wear traditional attire – kente is most common among Akan families. The bride may wear white kente and gold jewelry, while the groom wears matching kente cloth. Color coordination between families is also important.",
    ],
    tips: [
      "Meet with the bride's family early to discuss and receive the list",
      "Budget carefully – traditional engagements can be costly with all requirements",
      "Hire a traditional master of ceremonies (MC) who knows the customs",
      "Coordinate attire colors between both families for beautiful photos",
      "Create a digital invitation that explains the ceremony for guests unfamiliar with traditions",
    ],
  },
  "beautiful-ghanaian-wedding-themes": {
    content: [
      "Modern Ghanaian weddings are a canvas for creativity, blending traditional elements with contemporary design. Here are ten stunning themes to inspire your celebration.",
      "## 1. Classic Kente Elegance",
      "Let the iconic kente cloth be your star. Use kente patterns in invitations, décor, and of course, attire. Gold and rich colors create a regal atmosphere.",
      "## 2. Modern Minimalist",
      "Clean lines, neutral colors, and simple elegance. Think white and gold with touches of greenery. Perfect for couples who appreciate understated sophistication.",
      "## 3. Garden Romance",
      "Outdoor celebrations with lush florals, natural lighting, and romantic details. Ghana's beautiful gardens and resorts provide stunning backdrops.",
      "## 4. Royal Ashanti",
      "Inspired by Ashanti royalty with gold accents, purple fabrics, and traditional symbols. Incorporate adinkra symbols for added cultural significance.",
      "## 5. Beach Paradise",
      "For coastal ceremonies, embrace the ocean blues, sandy neutrals, and tropical flowers. Ghana's beaches offer magical sunset wedding moments.",
      "## 6. Vintage Glamour",
      "Old Hollywood meets Ghanaian elegance. Think Art Deco details, champagne towers, and old-fashioned romanticism with a modern twist.",
      "## 7. Bohemian African",
      "Free-spirited and earthy with African prints, dried pampas grass, and eclectic details. Perfect for creative, artistic couples.",
      "## 8. Pan-African Pride",
      "Celebrate the continent with elements from various African cultures – Ankara prints, African masks, and diverse artistic elements.",
      "## 9. Contemporary Fusion",
      "East meets West in this blend of traditional and modern. Think clean contemporary design with strategic traditional touches.",
      "## 10. Rustic Ghanaian",
      "Natural materials, warm woods, and traditional craftsmanship. Incorporate local artisan work for an authentic, heartfelt feel.",
    ],
    tips: [
      "Choose a theme that reflects your personality as a couple",
      "Ensure your theme works for both traditional and white wedding ceremonies",
      "Create cohesive digital invitations that preview your wedding aesthetic",
      "Work with local vendors who understand your vision",
      "Remember: the theme should enhance, not overshadow, the celebration of your love",
    ],
  },
  "creating-memorable-birthday-celebrations": {
    content: [
      "From first birthdays to milestone celebrations, Ghanaians know how to throw a memorable party. Here's how to create birthday celebrations that guests will remember for years.",
      "## First Birthday Celebrations",
      "The first birthday is especially significant – baby has survived the crucial first year! Many families combine it with thanksgiving. Consider themes like 'One-derful,' African safari, or traditional Ghanaian elements.",
      "## Children's Birthdays",
      "For children's parties, think entertainment: bouncy castles, face painting, games, and child-friendly food. Themes based on favorite cartoons or characters are always a hit.",
      "## Milestone Birthdays",
      "30th, 40th, 50th, and beyond deserve special attention. These often become larger celebrations, sometimes resembling mini-weddings with elaborate décor, entertainment, and catering.",
      "## 60th and Beyond",
      "Elder birthdays are community celebrations. These events honor a life well-lived and often include tributes from family, friends, and community members. A digital tribute wall can collect messages from near and far.",
      "## Surprise Parties",
      "The key to successful surprises is coordination. Use digital invitations with 'surprise' warnings, coordinate with a trusted insider, and have a backup plan if the guest of honor suspects something!",
      "## Party Planning Essentials",
      "Regardless of age, certain elements are universal: a stunning cake, great music, delicious food (jollof rice, of course!), and capturing memories through photos and videos.",
    ],
    tips: [
      "Start planning at least 2-3 months ahead for milestone celebrations",
      "Use digital invitations for easy RSVP tracking and coordination",
      "Consider live streaming for family members who can't attend",
      "Create a hashtag for social media sharing",
      "Hire a professional photographer for milestone birthdays – you'll want to remember these moments",
    ],
  },
};

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);
  const content = slug ? blogContent[slug] : null;

  if (!post) {
    return (
      <Layout>
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

  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <Layout>
      <SEO 
        title={post.title}
        description={post.excerpt}
        keywords={`${post.category}, Ghana events, VibeLink blog`}
        canonical={`/blog/${slug}`}
        ogImage={post.image}
        ogType="article"
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
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
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
              src={post.image}
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
              className="prose prose-lg max-w-none"
            >
              {content ? (
                <>
                  {content.content.map((paragraph, index) => {
                    if (paragraph.startsWith("## ")) {
                      return (
                        <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
                          {paragraph.replace("## ", "")}
                        </h2>
                      );
                    }
                    return (
                      <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    );
                  })}

                  {content.tips && (
                    <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border">
                      <h3 className="text-xl font-bold text-foreground mb-4">
                        Key Takeaways
                      </h3>
                      <ul className="space-y-3">
                        {content.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Full article content coming soon. Check back later!
                  </p>
                </div>
              )}
            </motion.div>

            {/* Share */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 pt-8 border-t border-border"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <span className="text-foreground font-medium">Share this article:</span>
                <div className="flex items-center gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </a>
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
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-2">
                      {relatedPost.readTime}
                    </p>
                  </div>
                </Link>
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
