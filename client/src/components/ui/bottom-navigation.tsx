import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { icon: "fas fa-home", label: "Home", path: "/", testId: "nav-home" },
    { icon: "fas fa-list", label: "Transactions", path: "/transactions", testId: "nav-transactions" },
    { icon: "fas fa-chart-pie", label: "Reports", path: "/reports", testId: "nav-reports" },
    { icon: "fas fa-cog", label: "Settings", path: "/settings", testId: "nav-settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t safe-area-bottom z-40">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center justify-center touch-manipulation transition-colors ${
              location === item.path 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={item.testId}
          >
            <i className={`${item.icon} text-lg mb-1`}></i>
            <span className={`text-xs ${location === item.path ? "font-medium" : ""}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
