import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import {
  Home,
  Activity,
  BarChart3,
  Settings,
  User,
} from "lucide-react";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
  ];

  const secondaryNavItems = [
    { id: "progress", label: "Progress", icon: BarChart3 },
  ];

  const bottomNavItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const NavButton = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-3",
        isActive && "bg-primary text-primary-foreground"
      )}
      onClick={() => onViewChange(item.id)}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto text-xs">
          {item.badge}
        </Badge>
      )}
    </Button>
  );

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2 px-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold">FitTracker</span>
      </div>

      {/* Main Navigation */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground px-2 mb-2">MAIN</p>
        {mainNavItems.map((item) => (
          <NavButton key={item.id} item={item} isActive={activeView === item.id} />
        ))}
      </div>

      {/* Secondary Navigation */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground px-2 mb-2">TRACKING</p>
        {secondaryNavItems.map((item) => (
          <NavButton key={item.id} item={item} isActive={activeView === item.id} />
        ))}
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
        <h4 className="font-medium mb-1">This Week</h4>
        <p className="text-sm opacity-90 mb-3">3 of 5 workouts completed</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-1.5">
            <div className="bg-white rounded-full h-1.5 w-3/5"></div>
          </div>
          <span className="text-xs">60%</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-auto space-y-1">
        {bottomNavItems.map((item) => (
          <NavButton key={item.id} item={item} isActive={activeView === item.id} />
        ))}
      </div>
    </div>
  );
}