import { useEffect, useState, useCallback } from 'react';

// ─── Rule Definitions ────────────────────────────────────────────────────────

const RULES = {
  // Title
  missingTitle: () => {
    const t = document.querySelector('title');
    if (!t || !t.textContent.trim()) return { id: 'missingTitle', severity: 'error', category: 'Meta', message: 'Missing <title> tag.' };
  },
  titleLength: () => {
    const t = document.querySelector('title');
    if (!t) return;
    const len = t.textContent.trim().length;
    if (len < 30) return { id: 'titleLength', severity: 'warning', category: 'Meta', message: `<title> is too short (${len} chars). Aim for 30–60.` };
    if (len > 60) return { id: 'titleLength', severity: 'warning', category: 'Meta', message: `<title> is too long (${len} chars). Keep under 60.` };
  },

  // Meta Description
  missingDescription: () => {
    const m = document.querySelector('meta[name="description"]');
    if (!m || !m.getAttribute('content')?.trim()) return { id: 'missingDescription', severity: 'error', category: 'Meta', message: 'Missing meta description.' };
  },
  descriptionLength: () => {
    const m = document.querySelector('meta[name="description"]');
    if (!m) return;
    const len = m.getAttribute('content')?.trim().length || 0;
    if (len < 50) return { id: 'descriptionLength', severity: 'warning', category: 'Meta', message: `Meta description too short (${len} chars). Aim for 120–160.` };
    if (len > 160) return { id: 'descriptionLength', severity: 'warning', category: 'Meta', message: `Meta description too long (${len} chars). Keep under 160.` };
  },

  // Open Graph
  missingOgTitle: () => {
    if (!document.querySelector('meta[property="og:title"]')) return { id: 'missingOgTitle', severity: 'warning', category: 'Open Graph', message: 'Missing og:title meta tag.' };
  },
  missingOgDescription: () => {
    if (!document.querySelector('meta[property="og:description"]')) return { id: 'missingOgDescription', severity: 'warning', category: 'Open Graph', message: 'Missing og:description meta tag.' };
  },
  missingOgImage: () => {
    if (!document.querySelector('meta[property="og:image"]')) return { id: 'missingOgImage', severity: 'warning', category: 'Open Graph', message: 'Missing og:image meta tag.' };
  },
  missingOgUrl: () => {
    if (!document.querySelector('meta[property="og:url"]')) return { id: 'missingOgUrl', severity: 'info', category: 'Open Graph', message: 'Missing og:url meta tag.' };
  },

  // Twitter Card
  missingTwitterCard: () => {
    if (!document.querySelector('meta[name="twitter:card"]')) return { id: 'missingTwitterCard', severity: 'info', category: 'Twitter', message: 'Missing twitter:card meta tag.' };
  },
  missingTwitterTitle: () => {
    if (!document.querySelector('meta[name="twitter:title"]')) return { id: 'missingTwitterTitle', severity: 'info', category: 'Twitter', message: 'Missing twitter:title meta tag.' };
  },

  // Headings
  missingH1: () => {
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) return { id: 'missingH1', severity: 'error', category: 'Structure', message: 'No <h1> tag found on the page.' };
  },
  multipleH1: () => {
    const h1s = document.querySelectorAll('h1');
    if (h1s.length > 1) return { id: 'multipleH1', severity: 'warning', category: 'Structure', message: `Found ${h1s.length} <h1> tags. Use only one per page.` };
  },

  // Images
  imagesWithoutAlt: () => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(img => !img.getAttribute('alt')?.trim());
    if (imgs.length > 0) return { id: 'imagesWithoutAlt', severity: 'error', category: 'Accessibility', message: `${imgs.length} image(s) missing alt attribute.` };
  },

  // Canonical
  missingCanonical: () => {
    if (!document.querySelector('link[rel="canonical"]')) return { id: 'missingCanonical', severity: 'warning', category: 'Meta', message: 'Missing canonical link tag.' };
  },

  // Viewport
  missingViewport: () => {
    if (!document.querySelector('meta[name="viewport"]')) return { id: 'missingViewport', severity: 'error', category: 'Mobile', message: 'Missing viewport meta tag.' };
  },

  // Lang attribute
  missingLang: () => {
    if (!document.documentElement.getAttribute('lang')?.trim()) return { id: 'missingLang', severity: 'warning', category: 'Accessibility', message: 'Missing lang attribute on <html>.' };
  },

  // Robots
  robotsNoIndex: () => {
    const r = document.querySelector('meta[name="robots"]');
    if (r && /noindex/i.test(r.getAttribute('content') || '')) return { id: 'robotsNoIndex', severity: 'error', category: 'Indexability', message: 'Page has robots noindex — will not be indexed.' };
  },

  // External links
  externalLinksNoRel: () => {
    const host = window.location.hostname;
    const bad = Array.from(document.querySelectorAll('a[href]')).filter(a => {
      try {
        const url = new URL(a.getAttribute('href'), window.location.href);
        if (url.hostname === host) return false;
        const rel = a.getAttribute('rel') || '';
        return !rel.includes('noopener') && !rel.includes('noreferrer');
      } catch { return false; }
    });
    if (bad.length > 0) return { id: 'externalLinksNoRel', severity: 'warning', category: 'Security', message: `${bad.length} external link(s) missing rel="noopener noreferrer".` };
  },

  // Structured data
  missingStructuredData: () => {
    if (!document.querySelector('script[type="application/ld+json"]')) return { id: 'missingStructuredData', severity: 'info', category: 'Structured Data', message: 'No JSON-LD structured data found.' };
  },

  // Heading hierarchy
  headingHierarchy: () => {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    let lastLevel = 0;
    for (const h of headings) {
      const level = parseInt(h.tagName[1]);
      if (level - lastLevel > 1 && lastLevel !== 0) return { id: 'headingHierarchy', severity: 'warning', category: 'Structure', message: `Heading hierarchy skips levels (e.g. h${lastLevel} → h${level}).` };
      lastLevel = level;
    }
  },

  // Favicon
  missingFavicon: () => {
    if (!document.querySelector('link[rel*="icon"]')) return { id: 'missingFavicon', severity: 'info', category: 'Meta', message: 'No favicon link tag found.' };
  },
};

// ─── Score Calculation ────────────────────────────────────────────────────────

function calcScore(issues) {
  const deductions = { error: 15, warning: 5, info: 1 };
  let score = 100;
  for (const issue of issues) score -= (deductions[issue.severity] || 0);
  return Math.max(0, score);
}

function scoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

// ─── Overlay UI ──────────────────────────────────────────────────────────────

const SEVERITY_COLORS = { error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
const SEVERITY_ICONS  = { error: '✕', warning: '⚠', info: 'ℹ' };

function Overlay({ issues, score, onClose }) {
  const [filter, setFilter] = useState('all');
  const categories = ['all', ...new Set(issues.map(i => i.category))];
  const visible = filter === 'all' ? issues : issues.filter(i => i.category === filter);
  const errors   = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const infos    = issues.filter(i => i.severity === 'info').length;

  const panelStyle = {
    position: 'fixed', bottom: 20, right: 20, zIndex: 999999,
    width: 380, maxHeight: '80vh', overflow: 'auto',
    background: '#0f172a', color: '#e2e8f0',
    borderRadius: 12, boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 13, border: '1px solid #1e293b',
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: scoreColor(score), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>
            {score}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>SEO Analyzer</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>
              {errors > 0 && <span style={{ color: '#ef4444', marginRight: 8 }}>✕ {errors} errors</span>}
              {warnings > 0 && <span style={{ color: '#f59e0b', marginRight: 8 }}>⚠ {warnings} warnings</span>}
              {infos > 0 && <span style={{ color: '#3b82f6' }}>ℹ {infos} info</span>}
              {issues.length === 0 && <span style={{ color: '#22c55e' }}>✓ All checks passed</span>}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, padding: 4 }}>×</button>
      </div>

      {/* Category filter */}
      {issues.length > 0 && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '2px 8px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 11,
              background: filter === cat ? '#3b82f6' : '#1e293b',
              color: filter === cat ? '#fff' : '#94a3b8',
            }}>{cat}</button>
          ))}
        </div>
      )}

      {/* Issues list */}
      <div style={{ padding: '8px 0' }}>
        {visible.length === 0 && (
          <div style={{ padding: '16px', color: '#22c55e', textAlign: 'center' }}>✓ No issues in this category</div>
        )}
        {visible.map(issue => (
          <div key={issue.id} style={{ padding: '8px 16px', display: 'flex', gap: 10, borderBottom: '1px solid #0f172a' }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: SEVERITY_COLORS[issue.severity], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: '#fff', fontWeight: 700, marginTop: 1 }}>
              {SEVERITY_ICONS[issue.severity]}
            </div>
            <div>
              <div style={{ color: '#e2e8f0', lineHeight: 1.4 }}>{issue.message}</div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>{issue.category}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #1e293b', color: '#475569', fontSize: 11, textAlign: 'center' }}>
        react-seo-analyzer · dev only
      </div>
    </div>
  );
}

// ─── Collapsed Badge ─────────────────────────────────────────────────────────

function Badge({ score, errorCount, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 999999,
      background: '#0f172a', border: `2px solid ${scoreColor(score)}`,
      borderRadius: 999, padding: '6px 14px',
      display: 'flex', alignItems: 'center', gap: 8,
      cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <span style={{ fontWeight: 700, color: scoreColor(score), fontSize: 14 }}>{score}</span>
      <span style={{ color: '#94a3b8', fontSize: 12 }}>SEO</span>
      {errorCount > 0 && (
        <span style={{ background: '#ef4444', color: '#fff', borderRadius: 999, padding: '1px 6px', fontSize: 11, fontWeight: 700 }}>{errorCount}</span>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * SEOAnalyzer
 *
 * @param {object}   props
 * @param {boolean}  [props.devOnly=true]      - Only run in development (NODE_ENV !== 'production')
 * @param {boolean}  [props.overlay=true]      - Show the floating UI overlay
 * @param {boolean}  [props.console=true]      - Also log issues to console
 * @param {string[]} [props.disableRules]      - Array of rule IDs to skip
 * @param {function} [props.onIssues]          - Callback (issues, score) => void
 */
export default function SEOAnalyzer({
  devOnly = true,
  overlay = true,
  console: logToConsole = true,
  disableRules = [],
  onIssues,
}) {
  const [issues, setIssues] = useState([]);
  const [score, setScore]   = useState(100);
  const [open, setOpen]     = useState(true);

  const runAnalysis = useCallback(() => {
    const results = Object.entries(RULES)
      .filter(([id]) => !disableRules.includes(id))
      .map(([, fn]) => { try { return fn(); } catch { return null; } })
      .filter(Boolean);

    const s = calcScore(results);
    setIssues(results);
    setScore(s);

    if (logToConsole) {
      if (results.length === 0) {
        console.log('%c SEO Analyzer ✓ No issues detected ', 'background:#22c55e;color:#fff;padding:2px 6px;border-radius:4px;font-weight:bold;');
      } else {
        console.group('%c SEO Analyzer — Score: ' + s + '/100 ', 'background:#0f172a;color:#e2e8f0;padding:2px 6px;border-radius:4px;font-weight:bold;');
        results.forEach(i => {
          const styles = { error: 'color:#ef4444', warning: 'color:#f59e0b', info: 'color:#3b82f6' };
          console.warn(`%c[${i.severity.toUpperCase()}] ${i.message}`, styles[i.severity]);
        });
        console.groupEnd();
      }
    }

    onIssues?.(results, s);
  }, [disableRules, logToConsole, onIssues]);

  useEffect(() => {
    if (devOnly && process.env.NODE_ENV === 'production') return;

    // Run after paint so DOM is settled
    const id = requestAnimationFrame(() => setTimeout(runAnalysis, 300));
    return () => cancelAnimationFrame(id);
  }, [devOnly, runAnalysis]);

  if (devOnly && process.env.NODE_ENV === 'production') return null;
  if (!overlay) return null;

  const errorCount = issues.filter(i => i.severity === 'error').length;

  return open
    ? <Overlay issues={issues} score={score} onClose={() => setOpen(false)} />
    : <Badge score={score} errorCount={errorCount} onClick={() => setOpen(true)} />;
}
