import { useState } from 'react';
import {
  BarChart3,
  KeyRound,
  Layers,
  Package,
  Users,
  Settings,
  Sun,
  Moon,
  MoreHorizontal,
  PanelLeft,
  LogOut,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import logoWithName from '@/assets/logo-with-name.svg';
import { useDashboardStore, useCollectionsStore, useAuthStore } from '@/store';
import { authClient } from '@/lib/auth-client';
import type { Section } from '@/types/dashboard';
import { useEffect } from 'react';

const navItems: { section: Section; label: string; icon: typeof BarChart3 }[] = [
  { section: 'analytics', label: 'Analytics', icon: BarChart3 },
  { section: 'entitlements', label: 'Entitlements', icon: KeyRound },
  { section: 'plans', label: 'Plans', icon: Layers },
  { section: 'products', label: 'Products', icon: Package },
  { section: 'customers', label: 'Customers', icon: Users },
];

const hardcodedCollections = [
  { id: 'potalink', name: 'Pota Link App' },
  { id: 'formly', name: 'Formly' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const {
    activeSection,
    setSection,
    environment,
    setEnvironment,
    activeCollectionId,
    setActiveCollection,
  } = useDashboardStore();
  const { collections, fetch: fetchCollections } = useCollectionsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const displayCollections = collections.length > 0
    ? collections.map(c => ({ id: c.id, name: c.name }))
    : hardcodedCollections;

  const activeCollection =
    displayCollections.find(c => c.id === activeCollectionId) ?? displayCollections[0];

  const displayName =
    environment === 'sandbox' ? 'Sandbox' : (activeCollection?.name ?? 'Select Collection');

  const handleSelectCollection = (id: string) => {
    setActiveCollection(id);
    setEnvironment('production');
  };

  const userInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() ?? '?';

  const userName = user?.name ?? 'User';
  const userEmail = user?.email ?? '';

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = '/';
  }

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col justify-between border-r border-border bg-muted/40 py-3 text-sm transition-all duration-200 ${
        collapsed ? 'w-14 px-2' : 'w-60 px-3'
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Brand + collapse toggle */}
        <div
          className={`flex items-center px-1 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed && (
            <img src={logoWithName} alt="OceanLabs" className="h-5 w-auto" />
          )}
          <button
            type="button"
            onClick={() => setCollapsed(prev => !prev)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Collection switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex items-center rounded-md px-2 py-1.5 text-left hover:bg-muted/70 ${
              collapsed ? 'justify-center' : 'justify-between gap-2'
            }`}
            title={collapsed ? displayName : undefined}
          >
            {collapsed ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                {displayName.charAt(0)}
              </span>
            ) : (
              <>
                <span className="truncate text-base font-semibold text-foreground">
                  {displayName}
                </span>
                <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {displayCollections.map(c => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => handleSelectCollection(c.id)}
              >
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sandbox / Production toggle */}
        {!collapsed && (
          <div>
            <div
              className={`flex items-center gap-0.5 rounded-md p-0.5 transition-colors ${
                environment === 'sandbox'
                  ? 'bg-amber-500/10 ring-1 ring-inset ring-amber-500/40'
                  : 'bg-muted'
              }`}
            >
              <button
                type="button"
                onClick={() => setEnvironment('sandbox')}
                className={`flex-1 rounded-[5px] px-2 py-1 text-xs font-medium transition-colors ${
                  environment === 'sandbox'
                    ? 'bg-amber-500/20 text-amber-700 shadow-sm dark:text-amber-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sandbox
              </button>
              <button
                type="button"
                onClick={() => setEnvironment('production')}
                className={`flex-1 rounded-[5px] px-2 py-1 text-xs font-medium transition-colors ${
                  environment === 'production'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Production
              </button>
            </div>
            {environment === 'sandbox' && (
              <p className="mt-1.5 px-1 text-[11px] leading-snug text-amber-600 dark:text-amber-400">
                Test data only — changes here never touch production.
              </p>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 pt-1">
          {navItems.map(({ section, label, icon: Icon }) => (
            <button
              key={section}
              type="button"
              onClick={() => setSection(section)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                activeSection === section
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-0.5 border-t border-border pt-2">
        <button
          type="button"
          onClick={() => setSection('settings')}
          title={collapsed ? 'Settings' : undefined}
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
            collapsed ? 'justify-center' : ''
          } ${
            activeSection === 'settings'
              ? 'bg-muted font-medium text-foreground'
              : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && 'Settings'}
        </button>

        <div
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {!collapsed && (
            <span className="flex-1 text-muted-foreground">Theme</span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* User avatar with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`mt-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/50 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-[#B15CE8] text-xs text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <span className="flex-1 min-w-0 leading-tight">
                  <span className="block truncate font-medium text-foreground">
                    {userName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {userEmail}
                  </span>
                </span>
                <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem onClick={() => setSection('profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSection('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
