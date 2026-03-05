/**
 * test/SEOAnalyzer.test.js
 *
 * Run with:  npm test
 * Requires:  @testing-library/react, @testing-library/jest-dom, jest, jest-environment-jsdom
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SEOAnalyzer from '../src/SEOAnalyzer';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reset <head> and <html> attributes before each test */
beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
});

/** Silence console noise during tests */
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'group').mockImplementation(() => {});
  jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
});

afterAll(() => jest.restoreAllMocks());

/** Helper: inject a fully-valid <head> so only the thing we're testing is missing */
function setValidHead(overrides = {}) {
  const defaults = {
    title: 'A perfectly fine page title here',
    description: 'This is a good meta description that is definitely long enough for SEO purposes and within limits.',
    canonical: true,
    viewport: true,
    lang: true,
    ogTitle: true,
    ogDescription: true,
    ogImage: true,
  };
  const cfg = { ...defaults, ...overrides };

  if (cfg.title)       document.title = cfg.title;
  if (cfg.description) setMeta('name', 'description', cfg.description);
  if (cfg.canonical)   setLink('canonical', 'https://example.com');
  if (cfg.viewport)    setMeta('name', 'viewport', 'width=device-width');
  if (cfg.lang)        document.documentElement.setAttribute('lang', 'en');
  if (cfg.ogTitle)     setMeta('property', 'og:title', 'Page Title');
  if (cfg.ogDescription) setMeta('property', 'og:description', 'Page desc');
  if (cfg.ogImage)     setMeta('property', 'og:image', 'https://example.com/img.jpg');
}

function setMeta(attr, name, content) {
  const m = document.createElement('meta');
  m.setAttribute(attr, name);
  m.setAttribute('content', content);
  document.head.appendChild(m);
}

function setLink(rel, href) {
  const l = document.createElement('link');
  l.setAttribute('rel', rel);
  l.setAttribute('href', href);
  document.head.appendChild(l);
}

function capturedIssues(onIssues) {
  return new Promise(resolve => onIssues.mockImplementation((issues) => resolve(issues)));
}

// ─── Title ────────────────────────────────────────────────────────────────────

describe('missingTitle', () => {
  it('flags when title is absent', async () => {
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('missingTitle');
  });

  it('does not flag when title is present', async () => {
    setValidHead();
    document.body.innerHTML = '<h1>Hello</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).not.toContain('missingTitle');
  });
});

describe('titleLength', () => {
  it('warns when title is too short', async () => {
    setValidHead({ title: 'Hi' });
    document.body.innerHTML = '<h1>Hello</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('titleLength');
  });

  it('warns when title is too long', async () => {
    setValidHead({ title: 'A'.repeat(70) });
    document.body.innerHTML = '<h1>Hello</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('titleLength');
  });
});

// ─── Meta Description ─────────────────────────────────────────────────────────

describe('missingDescription', () => {
  it('flags when meta description is absent', async () => {
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('missingDescription');
  });
});

describe('descriptionLength', () => {
  it('warns when description is too short', async () => {
    setValidHead({ description: 'Too short.' });
    document.body.innerHTML = '<h1>Hello</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('descriptionLength');
  });
});

// ─── Headings ─────────────────────────────────────────────────────────────────

describe('missingH1', () => {
  it('flags when no h1 exists', async () => {
    setValidHead();
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('missingH1');
  });

  it('does not flag when h1 exists', async () => {
    setValidHead();
    document.body.innerHTML = '<h1>Main heading</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).not.toContain('missingH1');
  });
});

describe('multipleH1', () => {
  it('warns when multiple h1 tags exist', async () => {
    setValidHead();
    document.body.innerHTML = '<h1>First</h1><h1>Second</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('multipleH1');
  });
});

// ─── Images ───────────────────────────────────────────────────────────────────

describe('imagesWithoutAlt', () => {
  it('flags images missing alt attribute', async () => {
    setValidHead();
    document.body.innerHTML = '<h1>Hello</h1><img src="a.jpg" /><img src="b.jpg" />';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('imagesWithoutAlt');
  });

  it('does not flag images with alt attribute', async () => {
    setValidHead();
    document.body.innerHTML = '<h1>Hello</h1><img src="a.jpg" alt="A photo" />';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).not.toContain('imagesWithoutAlt');
  });
});

// ─── Viewport ─────────────────────────────────────────────────────────────────

describe('missingViewport', () => {
  it('flags when viewport meta is absent', async () => {
    setValidHead({ viewport: false });
    document.body.innerHTML = '<h1>Hello</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('missingViewport');
  });
});

// ─── Lang ─────────────────────────────────────────────────────────────────────

describe('missingLang', () => {
  it('flags when html lang is absent', async () => {
    setValidHead({ lang: false });
    document.body.innerHTML = '<h1>Hello</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('missingLang');
  });
});

// ─── Open Graph ───────────────────────────────────────────────────────────────

describe('Open Graph tags', () => {
  it('flags missing og:title', async () => {
    setValidHead({ ogTitle: false });
    document.body.innerHTML = '<h1>Hello</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('missingOgTitle');
  });

  it('flags missing og:image', async () => {
    setValidHead({ ogImage: false });
    document.body.innerHTML = '<h1>Hello</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('missingOgImage');
  });
});

// ─── External Links ───────────────────────────────────────────────────────────

describe('externalLinksNoRel', () => {
  it('flags external links without rel attribute', async () => {
    setValidHead();
    document.body.innerHTML = '<h1>Hello</h1><a href="https://external-site.com">Link</a>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).toContain('externalLinksNoRel');
  });

  it('does not flag external links with noopener', async () => {
    setValidHead();
    document.body.innerHTML = '<h1>Hello</h1><a href="https://external-site.com" rel="noopener noreferrer">Link</a>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    expect(issues.map(i => i.id)).not.toContain('externalLinksNoRel');
  });
});

// ─── disableRules prop ────────────────────────────────────────────────────────

describe('disableRules prop', () => {
  it('skips rules listed in disableRules', async () => {
    const onIssues = jest.fn();
    render(
      <SEOAnalyzer
        devOnly={false}
        overlay={false}
        onIssues={onIssues}
        disableRules={['missingTitle', 'missingDescription', 'missingH1', 'missingViewport', 'missingLang']}
      />
    );
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues] = onIssues.mock.calls[0];
    const ids = issues.map(i => i.id);
    expect(ids).not.toContain('missingTitle');
    expect(ids).not.toContain('missingDescription');
    expect(ids).not.toContain('missingH1');
  });
});

// ─── Scoring ─────────────────────────────────────────────────────────────────

describe('score', () => {
  it('returns 100 when all checks pass', async () => {
    setValidHead();
    document.body.innerHTML = '<h1>Hello</h1>';
    // Also add twitter, structured data, favicon, canonical already set
    setMeta('name', 'twitter:card', 'summary');
    setMeta('name', 'twitter:title', 'Title');
    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = '{}';
    document.head.appendChild(jsonLd);
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = '/favicon.ico';
    document.head.appendChild(favicon);

    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [, score] = onIssues.mock.calls[0];
    expect(score).toBe(100);
  });

  it('deducts 15 pts per error', async () => {
    // Just title missing = -15
    setValidHead({ title: false });
    document.body.innerHTML = '<h1>Hello</h1>';
    const onIssues = jest.fn();
    render(<SEOAnalyzer devOnly={false} overlay={false} onIssues={onIssues} />);
    await waitFor(() => expect(onIssues).toHaveBeenCalled());
    const [issues, score] = onIssues.mock.calls[0];
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const infos = issues.filter(i => i.severity === 'info').length;
    expect(score).toBe(Math.max(0, 100 - errors * 15 - warnings * 5 - infos * 1));
  });
});
