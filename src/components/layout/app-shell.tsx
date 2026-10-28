'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '../theme-toggle';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Receipt,
  Layers,
  Repeat,
  CreditCard,
  RotateCcw,
  BarChart3,
  MousePointerClick,
  Plug,
  Key,
  ShieldCheck,
  FileText,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AppShell({
  children,
  role = 'admin',
}: {
  children: React.ReactNode;
  role?: 'admin' | 'owner' | 'finance' | 'support' | 'client';
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
    getUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Admin Navigation Groups
  const adminGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Business',
      items: [
        { label: 'Clients', href: '/clients', icon: <Users className="h-4 w-4" /> },
        { label: 'Projects', href: '/projects', icon: <FolderGit2 className="h-4 w-4" /> },
        { label: 'Invoices', href: '/invoices', icon: <Receipt className="h-4 w-4" /> },
        { label: 'Instalment Plans', href: '/instalments', icon: <Layers className="h-4 w-4" /> },
        { label: 'Subscriptions', href: '/subscriptions', icon: <Repeat className="h-4 w-4" /> },
        { label: 'Payments', href: '/payments', icon: <CreditCard className="h-4 w-4" /> },
        { label: 'Refunds', href: '/refunds', icon: <RotateCcw className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Insights',
      items: [
        { label: 'Website Analytics', href: '/analytics', icon: <BarChart3 className="h-4 w-4" /> },
        { label: 'Integrations', href: '/integrations', icon: <Plug className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Control',
      items: [
        { label: 'Licence Keys', href: '/licences', icon: <Key className="h-4 w-4" /> },
        { label: 'Entitlements', href: '/entitlements', icon: <ShieldCheck className="h-4 w-4" /> },
        { label: 'Audit Logs', href: '/audit-logs', icon: <FileText className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
        { label: 'Team & RBAC', href: '/settings/team', icon: <UserCheck className="h-4 w-4" /> },
        { label: 'Privacy & DPDP', href: '/settings/privacy', icon: <Shield className="h-4 w-4" /> },
      ],
    },
  ];

  // Client Navigation Groups
  const clientGroups: NavGroup[] = [
    {
      title: 'Portal',
      items: [
        { label: 'Overview', href: '/portal', icon: <LayoutDashboard className="h-4 w-4" /> },
        { label: 'My Invoices', href: '/invoices', icon: <Receipt className="h-4 w-4" /> },
        { label: 'Payments', href: '/payments', icon: <CreditCard className="h-4 w-4" /> },
        { label: 'Instalments', href: '/instalments', icon: <Layers className="h-4 w-4" /> },
        { label: 'Licences', href: '/licences', icon: <Key className="h-4 w-4" /> },
      ],
    },
  ];

  const navGroups = role === 'client' ? clientGroups : adminGroups;

  // Compute breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex text-[var(--text-primary)]">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#111318] text-slate-200 border-r border-slate-800 shrink-0 z-30">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white text-base shadow-md shadow-violet-500/25">
              L
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>LostGit Pay</span>
                <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider rounded bg-violet-950 text-violet-400 border border-violet-800">
                  {role === 'client' ? 'Client' : 'SaaS'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Precision Financial Engine</p>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {group.title}
              </h4>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#6D5EF5] text-white shadow-sm font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-white truncate">{userEmail || 'Active Operator'}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{role}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out of LostGit Pay"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition focus-ring cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] focus-ring"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Link href="/admin" className="hover:text-[var(--text-primary)] transition">
                Pay
              </Link>
              {pathSegments.map((segment, idx) => {
                const isLast = idx === pathSegments.length - 1;
                const path = `/${pathSegments.slice(0, idx + 1).join('/')}`;
                return (
                  <React.Fragment key={path}>
                    <ChevronRight className="h-3 w-3 text-[var(--border-strong)]" />
                    <Link
                      href={path}
                      className={`capitalize ${
                        isLast ? 'font-semibold text-[var(--text-primary)]' : 'hover:text-[var(--text-primary)] transition'
                      }`}
                    >
                      {segment.replace(/-/g, ' ')}
                    </Link>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* System Status Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[11px] font-semibold text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operational</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Main Brand Link */}
            <a
              href="https://lostgit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              <span>LostGit</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-[#111318] text-white flex flex-col h-full shadow-2xl z-10 border-r border-slate-800">
            <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <div className="h-7 w-7 rounded bg-violet-600 flex items-center justify-center text-white">L</div>
                <span>LostGit Pay</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    {group.title}
                  </h4>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
                          pathname === item.href ? 'bg-[#6D5EF5] text-white' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 truncate">{userEmail}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-rose-400 font-semibold flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
