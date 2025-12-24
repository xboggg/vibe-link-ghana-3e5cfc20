import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ScrollToTop } from "@/components/ScrollToTop";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
}
