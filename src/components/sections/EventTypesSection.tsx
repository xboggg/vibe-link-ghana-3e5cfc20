import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const eventTypes = [
  { icon: "💒", title: "Weddings", slug: "wedding" },
  { icon: "⚰️", title: "Funerals", slug: "funeral" },
  { icon: "👶", title: "Naming Ceremonies", slug: "naming" },
  { icon: "💍", title: "Anniversaries", slug: "anniversary" },
  { icon: "🎓", title: "Graduations", slug: "graduation" },
  { icon: "⛪", title: "Church Events", slug: "church" },
  { icon: "🏢", title: "Corporate Events", slug: "corporate" },
];

export function EventTypesSection() {
  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium mb-4">
            Our Expertise
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            For Every <span className="text-gradient-gold">Ghanaian</span> Celebration
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From joyful weddings to solemn funerals, we create beautiful digital
            experiences that honor your traditions.
          </p>
        </motion.div>

        {/* Event Types Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {eventTypes.map((event, index) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                to={`/portfolio?type=${event.slug}`}
                className="group flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-gold transition-all duration-300"
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {event.icon}
                </span>
                <span className="text-sm font-medium text-foreground text-center">
                  {event.title}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
