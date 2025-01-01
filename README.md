# React SEO Analyzer

## Overview

React SEO Analyzer is a utility package that helps developers identify common SEO issues in their React applications. It checks for missing meta tags, improper alt attributes on images, multiple H1 tags, and more.

## Features

- Detect missing `<title>` tags.
- Check for a meta description and validate its length.
- Identify images missing `alt` attributes.
- Validate the presence of a canonical link.
- Ensure proper usage of `<h1>` tags.
- Check external links for proper `rel` attributes (e.g., `nofollow`, `noopener`).

## Installation

Install the package via npm:

```bash
npm install react-seo-analyzer
```

## Usage

Import and use the SEOAnalyzer component in your React application. It analyzes the DOM and logs SEO issues in the console.

### Example:

```javascript
import React from 'react';
import SEOAnalyzer from 'react-seo-analyzer';

const App = () => {
  return (
    <div>
      <SEOAnalyzer />
      <h1>Welcome to My Website</h1>
      <p>This is a sample website for demonstrating the React SEO Analyzer.</p>
    </div>
  );
};

export default App;
```

### Console Output:

If issues are found, they will be logged as warnings:

```plaintext
SEO Analyzer Issues:
["Missing <title> tag.", "Found 2 images without alt attributes."]
```

If no issues are detected:

```plaintext
SEO Analyzer: No issues detected.
```
