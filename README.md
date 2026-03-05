# react-seo-analyzer

[![npm version](https://img.shields.io/npm/v/react-seo-analyzer.svg?style=flat-square)](https://www.npmjs.com/package/react-seo-analyzer)
[![npm downloads](https://img.shields.io/npm/dm/react-seo-analyzer.svg?style=flat-square)](https://www.npmjs.com/package/react-seo-analyzer)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-seo-analyzer?style=flat-square)](https://bundlephobia.com/package/react-seo-analyzer)
[![license](https://img.shields.io/npm/l/react-seo-analyzer.svg?style=flat-square)](./LICENSE)

> 🔍 A zero-dependency SEO linter for React apps — with a live **visual overlay**, **20+ checks**, and an **SEO score** — all only in development mode.

---

## ✨ Why react-seo-analyzer?

Most React SEO tools require server-side rendering or manual auditing. **react-seo-analyzer** runs right inside your browser during development — giving you instant, inline feedback **as you build**.

| Feature | react-seo-analyzer | Lighthouse | Other libs |
|---|---|---|---|
| Dev-mode overlay | ✅ | ❌ | ❌ |
| SEO score | ✅ | ✅ | ❌ |
| 20+ checks | ✅ | ✅ | ⚠️ partial |
| Zero config | ✅ | ❌ | ⚠️ |
| Zero dependencies | ✅ | ❌ | ❌ |
| Auto-disabled in prod | ✅ | N/A | ❌ |

---

## 🚀 Installation

```bash
npm install react-seo-analyzer
# or
yarn add react-seo-analyzer
```

---

## 🔧 Usage

Drop `<SEOAnalyzer />` anywhere in your app. It renders nothing in production.

```jsx
import SEOAnalyzer from 'react-seo-analyzer';

function App() {
  return (
    <>
      <SEOAnalyzer />
      {/* your app */}
    </>
  );
}
```

A floating panel will appear in the bottom-right corner showing your **SEO score** and all issues, grouped by category. Click the badge to collapse it.

---

## ⚙️ Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `devOnly` | `boolean` | `true` | Only run in `NODE_ENV !== 'production'` |
| `overlay` | `boolean` | `true` | Show the floating UI panel |
| `console` | `boolean` | `true` | Also log issues to the browser console |
| `disableRules` | `string[]` | `[]` | Rule IDs to skip (see list below) |
| `onIssues` | `function` | — | Callback `(issues, score) => void` |

### Examples

```jsx
// Disable the overlay, use console output only
<SEOAnalyzer overlay={false} />

// Disable specific rules
<SEOAnalyzer disableRules={['missingStructuredData', 'missingTwitterCard']} />

// Use a callback for custom reporting
<SEOAnalyzer onIssues={(issues, score) => myReporter.send({ issues, score })} />
```

---

## 📋 Checks

### 🔴 Errors (–15 pts each)
| Rule ID | Description |
|---|---|
| `missingTitle` | No `<title>` tag found |
| `missingDescription` | No meta description |
| `missingH1` | No `<h1>` on the page |
| `imagesWithoutAlt` | Images missing `alt` attribute |
| `missingViewport` | No viewport meta tag |
| `robotsNoIndex` | Page is set to noindex |

### 🟡 Warnings (–5 pts each)
| Rule ID | Description |
|---|---|
| `titleLength` | Title outside 30–60 character range |
| `descriptionLength` | Description outside 50–160 character range |
| `multipleH1` | More than one `<h1>` tag |
| `missingCanonical` | No canonical link tag |
| `missingLang` | No `lang` attribute on `<html>` |
| `missingOgTitle` | No `og:title` Open Graph tag |
| `missingOgDescription` | No `og:description` Open Graph tag |
| `missingOgImage` | No `og:image` Open Graph tag |
| `externalLinksNoRel` | External links missing `rel="noopener noreferrer"` |
| `headingHierarchy` | Heading levels are skipped |

### 🔵 Info (–1 pt each)
| Rule ID | Description |
|---|---|
| `missingOgUrl` | No `og:url` tag |
| `missingTwitterCard` | No `twitter:card` tag |
| `missingTwitterTitle` | No `twitter:title` tag |
| `missingStructuredData` | No JSON-LD structured data |
| `missingFavicon` | No favicon link tag |

---

## 📊 Scoring

Your SEO score starts at **100** and points are deducted per issue:

```
Errors   → –15 pts each
Warnings → –5 pts each
Info     → –1 pt each
```

| Score | Status |
|---|---|
| 80–100 | 🟢 Good |
| 50–79 | 🟡 Needs work |
| 0–49 | 🔴 Critical |

---

## 🤝 Contributing

Contributions are welcome!

- Fork the repo
- Create a feature branch
- Run tests: `npm test`
- Submit a PR

Have a rule idea? [Open an issue](https://github.com/artakharutyunyan/react-seo-analyzer/issues).

---

## 📄 License

MIT © [Artak Harutyunyan](https://github.com/artakharutyunyan)
