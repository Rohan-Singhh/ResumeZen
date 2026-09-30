import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';
import Modal, { ModalHeader } from './ui/Modal';
import Button from './ui/Button';
import { scrollToSection } from '../utils/scrollToSection';

const linkClass = 'text-sm text-ink-muted hover:text-ink';

const socialClass =
  'flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-muted hover:border-line-strong hover:text-ink';

function Column({ title, children }) {
  return (
    <div>
      <h3 className="t-label mb-5">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  // Pages that are not written yet open a short "coming soon" note
  const [pending, setPending] = useState(null);
  const soon = (title) => () => setPending(title);

  // Section links work from any page: go to the landing page first if needed
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const toSection = (id) => (e) => {
    e.preventDefault();
    if (pathname !== '/') navigate('/');
    scrollToSection(id);
  };

  return (
    <footer className="border-t border-line pb-8 pt-16">
      <div className="shell">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Link to="/" aria-label="ResumeZen home" className="inline-flex rounded-md">
              <Logo size="md" />
            </Link>
            <p className="t-body mt-5 max-w-xs">
              Your resume, read the way a recruiter will read it, with the marks to prove it.
            </p>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={soon('Facebook page')} aria-label="Facebook" className={socialClass}>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </button>
              <button type="button" onClick={soon('X profile')} aria-label="X" className={socialClass}>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <a href="https://github.com/Rohan-Singhh/ResumeZen" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={socialClass}>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <Column title="Product">
            <li><a href="/#features" onClick={toSection('features')} className={linkClass}>The report</a></li>
            <li><a href="/#how-it-works" onClick={toSection('how-it-works')} className={linkClass}>How it works</a></li>
            <li><a href="/#pricing" onClick={toSection('pricing')} className={linkClass}>Pricing</a></li>
            <li><Link to="/success-stories" className={linkClass}>Success stories</Link></li>
          </Column>

          <Column title="Resources">
            <li><a href="/#faq" onClick={toSection('faq')} className={linkClass}>FAQ</a></li>
            <li><a href="/#support" onClick={toSection('support')} className={linkClass}>Support</a></li>
            <li><button type="button" onClick={soon('Resume templates')} className={linkClass}>Resume templates</button></li>
            <li><button type="button" onClick={soon('Career blog')} className={linkClass}>Career blog</button></li>
          </Column>

          <Column title="Legal">
            <li><button type="button" onClick={soon('Privacy policy')} className={linkClass}>Privacy policy</button></li>
            <li><button type="button" onClick={soon('Terms of service')} className={linkClass}>Terms of service</button></li>
            <li><button type="button" onClick={soon('Cookie policy')} className={linkClass}>Cookie policy</button></li>
            <li><button type="button" onClick={soon('Data security')} className={linkClass}>Data security</button></li>
          </Column>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-meta">&copy; {currentYear} ResumeZen</p>
          <p className="t-meta">Made for people who are applying this week.</p>
        </div>
      </div>

      <Modal open={Boolean(pending)} onClose={() => setPending(null)} labelledBy="footer-soon-title" maxWidth="max-w-sm">
        <ModalHeader id="footer-soon-title" icon={ClockIcon} onClose={() => setPending(null)}>
          Not written yet
        </ModalHeader>
        <p className="t-body mb-6">
          The {pending?.toLowerCase()} is still being put together. It will be linked here when it is ready.
        </p>
        <Button variant="secondary" onClick={() => setPending(null)} className="w-full">Close</Button>
      </Modal>
    </footer>
  );
}
