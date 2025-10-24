import { Link, useLocation } from "react-router-dom";
import { Home, Grid3x3, BookHeart, Info, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/gallery", icon: Grid3x3, label: "Gallery" },
    { to: "/upload", icon: Upload, label: "Upload" },
    { to: "/memories", icon: BookHeart, label: "Memories" },
    { to: "/about", icon: Info, label: "About" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-handwriting text-2xl text-primary font-bold">
            harini
          </Link>
          
          <div className="flex items-center gap-1 md:gap-2">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-4 py-2 rounded-full transition-all duration-300",
                  location.pathname === to
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon size={18} />
                <span className="hidden sm:inline text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
