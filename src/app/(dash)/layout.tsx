'use client'
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Building2, 
  FileText, 
  Users, 
  Zap, 
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  Menu,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string | number;
}

interface DashboardData {
  vendorCount: number;
  xeroConnected: boolean;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({ vendorCount: 0, xeroConnected: false });

  // Load dashboard data for sidebar
  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [vendorsRes, xeroRes] = await Promise.all([
        fetch('/api/vendors/list'),
        fetch('/api/xero/status')
      ]);
      
      const vendorsData = await vendorsRes.json();
      const xeroData = await xeroRes.json();
      
      setDashboardData({
        vendorCount: vendorsData.vendors?.length || 0,
        xeroConnected: xeroData.connected || false
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  const mainNavItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/vendors', icon: Users, label: 'Vendors', badge: dashboardData.vendorCount },
    { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
  ];

  const integrationNavItems: NavItem[] = [
    { href: '/dashboard/xero', icon: Zap, label: 'Xero Integration' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
    // Reload data when route changes to keep counts fresh
    loadDashboardData();
  }, [pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
    return (
      <a 
        href={item.href} 
        onClick={onClick}
        className={`flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <item.icon className={`w-5 h-5 ${
          isActive 
            ? 'text-white' 
            : 'group-hover:text-slate-900'
        }`} />
        <span>{item.label}</span>
        {item.badge !== undefined && (
          <Badge 
            variant="secondary"
            className={`ml-auto text-xs font-mono ${
              isActive 
                ? 'bg-slate-700 text-slate-300 border-slate-600' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {item.badge}
          </Badge>
        )}
      </a>
    );
  }

  function SidebarContent({ pathname, onItemClick }: { pathname: string; onItemClick?: () => void }) {
    return (
      <>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
           <img src='/logo.avif' className="invert-[100]" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
            Main Menu
          </div>
          
          {mainNavItems.map((item) => (
            <NavLink 
              key={item.href} 
              item={item} 
              isActive={pathname === item.href}
              onClick={onItemClick}
            />
          ))}

          <Separator className="my-4" />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
            Integrations
          </div>

          {integrationNavItems.map((item) => (
            <NavLink 
              key={item.href} 
              item={item} 
              isActive={pathname === item.href}
              onClick={onItemClick}
            />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-100 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">System Status</p>
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>All systems operational</span>
                  {dashboardData.xeroConnected && (
                    <>
                      <span>•</span>
                      <span className="text-slate-700 font-medium">Xero Connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-white">
          <div className="flex flex-col h-full">
            <SidebarContent 
              pathname={pathname} 
              onItemClick={() => setSidebarOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search vendors, reports..." 
                  className="pl-10 bg-slate-50 border-0 focus:bg-white w-64 sm:w-80"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-slate-900 rounded-full"></div>
                <span className="sr-only">Notifications</span>
              </Button>
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}