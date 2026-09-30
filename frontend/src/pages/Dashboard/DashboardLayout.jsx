import React, { useEffect, useState } from 'react';
import { useOutlet, useNavigate, useLocation, NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  DocumentTextIcon,
  BriefcaseIcon,
  CreditCardIcon,
  UserCircleIcon,
  LifebuoyIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronDoubleLeftIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import HelpPanel from '../../components/HelpPanel';
import Logo from '../../components/Logo';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { duration, ease, spring } from '../../utils/motion';

const NAV = [
  { name: 'Overview', path: '/dashboard', icon: Squares2X2Icon },
  { name: 'Studio', path: '/dashboard/studio', icon: DocumentTextIcon },
  { name: 'Jobs', path: '/dashboard/jobs', icon: BriefcaseIcon },
  { name: 'Plans', path: '/dashboard/plans', icon: CreditCardIcon },
  { name: 'Profile', path: '/dashboard/profile', icon: UserCircleIcon },
];

const isActivePath = (pathname, path) =>
  pathname === path || (path !== '/dashboard' && pathname.startsWith(path));

const COLLAPSE_KEY = 'rz.sidebar.collapsed';

// Label that appears beside an icon-only control when the sidebar is collapsed
function RailTip({ show, children }) {
  if (!show) return null;
  return (
    <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded border border-line-strong bg-surface-overlay px-2 py-1 text-xs font-medium text-ink opacity-0 shadow-e2 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100">
      {children}
    </span>
  );
}

function CreditsCard({ collapsed }) {
  const navigate = useNavigate();
  const { activePlan, isUnlimited, creditsLeft, creditsTotal, creditsText, expiresAt } = useCredits();
  const toPlans = () => navigate('/dashboard/plans');

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toPlans}
        aria-label={`Credits: ${creditsText}. Open plans`}
        className="group relative mx-auto flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface font-mono text-[0.8125rem] text-ink hover:border-line-strong"
      >
        {creditsText}
        <RailTip show>{activePlan ? 'Credits left' : 'No plan yet'}</RailTip>
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-3.5 shadow-e1">
      <div className="flex items-baseline justify-between">
        <span className="t-label">Credits</span>
        {activePlan && !isUnlimited && <span className="t-meta">of {creditsTotal}</span>}
      </div>

      <p className="t-num mt-2.5 text-[2rem]">{creditsText}</p>

      {activePlan && !isUnlimited && (
        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-ink/70"
            initial={false}
            animate={{ scaleX: creditsTotal ? Math.min(1, creditsLeft / creditsTotal) : 0 }}
            transition={{ duration: 0.6, ease: ease.out }}
          />
        </div>
      )}

      <p className="mt-2.5 truncate text-[0.8125rem] text-ink-muted">
        {!activePlan
          ? 'No plan yet'
          : isUnlimited
            ? expiresAt ? `Unlimited until ${new Date(expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : 'Unlimited'
            : activePlan.planId.name}
      </p>

      {!isUnlimited && (
        <Button variant="secondary" size="sm" onClick={toPlans} className="mt-3 w-full">
          {activePlan ? 'Get more' : 'Choose a plan'}
        </Button>
      )}
    </div>
  );
}

function Sidebar({ onHelp }) {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch { /* private mode */ }
  }, [collapsed]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to log out', error);
      setIsLoggingOut(false);
    }
  };

  const itemBase =
    'group relative flex h-10 items-center rounded-md text-sm font-medium ' +
    (collapsed ? 'mx-auto w-10 justify-center' : 'gap-3 px-3');

  return (
    <aside
      className={`relative z-30 hidden flex-shrink-0 flex-col border-r border-line bg-surface-sunken transition-[width] duration-slow ease-out lg:flex ${
        collapsed ? 'w-[4.5rem]' : 'w-[15.5rem]'
      }`}
    >
      {/* Brand + collapse */}
      <div className={`flex h-16 flex-shrink-0 items-center ${collapsed ? 'justify-center' : 'justify-between pl-5 pr-3'}`}>
        <Link to="/dashboard" aria-label="ResumeZen overview" className="inline-flex rounded-md">
          <Logo size="sm" markOnly={collapsed} />
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-ink/[0.06] hover:text-ink"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Primary navigation */}
      <nav aria-label="Dashboard" className={`flex-1 space-y-1 pt-3 ${collapsed ? 'px-0' : 'px-3'}`}>
        {NAV.map((item) => {
          const active = isActivePath(pathname, item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              aria-label={collapsed ? item.name : undefined}
              className={`${itemBase} ${active ? 'text-ink' : 'text-ink-muted hover:bg-ink/[0.05] hover:text-ink'}`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-md border border-line bg-surface-raised shadow-e1"
                  transition={spring}
                >
                  {/* The mark: where you are */}
                  <span className="absolute -left-px top-2.5 bottom-2.5 w-[2px] rounded-full bg-primary" />
                </motion.span>
              )}
              <item.icon className="relative z-10 h-[1.125rem] w-[1.125rem] flex-shrink-0" />
              {!collapsed && <span className="relative z-10 truncate">{item.name}</span>}
              <RailTip show={collapsed}>{item.name}</RailTip>
            </NavLink>
          );
        })}

        <div className={`!mt-3 border-t border-line pt-3 ${collapsed ? 'mx-4' : ''}`} />

        <button type="button" onClick={onHelp} aria-label={collapsed ? 'Help' : undefined} className={`${itemBase} w-full text-ink-muted hover:bg-ink/[0.05] hover:text-ink`}>
          <LifebuoyIcon className="h-[1.125rem] w-[1.125rem] flex-shrink-0" />
          {!collapsed && <span>Help</span>}
          <RailTip show={collapsed}>Help</RailTip>
        </button>

        {collapsed && (
          <button type="button" onClick={() => setCollapsed(false)} aria-label="Expand sidebar" className={`${itemBase} text-ink-faint hover:bg-ink/[0.05] hover:text-ink`}>
            <ChevronDoubleLeftIcon className="h-4 w-4 rotate-180" />
            <RailTip show>Expand</RailTip>
          </button>
        )}
      </nav>

      {/* Credits + account */}
      <div className={`flex-shrink-0 space-y-3 pb-4 ${collapsed ? 'px-0' : 'px-3'}`}>
        <CreditsCard collapsed={collapsed} />

        <div className={`flex items-center border-t border-line pt-3 ${collapsed ? 'flex-col gap-2' : 'gap-2'}`}>
          <Link
            to="/dashboard/profile"
            title={currentUser?.email}
            className={`group relative flex min-w-0 items-center rounded-md hover:bg-ink/[0.05] ${collapsed ? 'p-1' : 'flex-1 gap-2.5 p-1.5'}`}
          >
            <Avatar user={currentUser} />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-[0.8125rem] font-medium text-ink">{currentUser?.name || 'Your account'}</span>
                <span className="block truncate text-xs text-ink-faint">{currentUser?.email}</span>
              </span>
            )}
            <RailTip show={collapsed}>{currentUser?.name || 'Profile'}</RailTip>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Log out"
            className="group relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-ink-faint hover:bg-bad/10 hover:text-bad"
          >
            {isLoggingOut ? <Spinner size={16} /> : <ArrowRightStartOnRectangleIcon className="h-[1.125rem] w-[1.125rem]" />}
            <RailTip show>Log out</RailTip>
          </button>
        </div>
      </div>
    </aside>
  );
}

// Phones and tablets: brand + balance on top, the five destinations under the thumb
function MobileTopBar({ onHelp }) {
  const { creditsText, activePlan } = useCredits();
  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-line bg-surface-void px-4 lg:hidden">
      <Link to="/dashboard" aria-label="ResumeZen overview" className="inline-flex rounded-md">
        <Logo size="sm" />
      </Link>
      <div className="flex items-center gap-1.5">
        <Link
          to="/dashboard/plans"
          className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[0.8125rem] text-ink-muted"
        >
          <span className="font-mono text-ink">{creditsText}</span>
          {activePlan ? 'credits' : 'no plan'}
        </Link>
        <button type="button" onClick={onHelp} aria-label="Help" className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted">
          <LifebuoyIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

function MobileTabBar() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Dashboard"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-void/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV.map((item) => {
          const active = isActivePath(pathname, item.path);
          return (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                className={`relative flex h-[3.75rem] flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium ${
                  active ? 'text-ink' : 'text-ink-faint'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tabbar-active"
                    className="absolute top-0 h-[2px] w-8 rounded-full bg-primary"
                    transition={spring}
                  />
                )}
                <item.icon className="h-[1.375rem] w-[1.375rem]" />
                {item.name}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);
  // Capture the outlet element per render. A live <Outlet /> inside the exiting
  // motion.div would already show the *new* tab while fading out, so each tab
  // switch flashed the destination twice.
  const outlet = useOutlet();

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-surface-void text-ink">
      <Sidebar onHelp={() => setHelpOpen(true)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar onHelp={() => setHelpOpen(true)} />

        <main className="flex-1 overflow-y-auto" data-dashboard-scroll>
          <div className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-7 sm:px-8 sm:pt-9 lg:px-10 lg:pb-14 lg:pt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: duration.page, ease: ease.out } }}
                exit={{ opacity: 0, transition: { duration: duration.fast, ease: ease.in } }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <MobileTabBar />
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
