import { useEffect } from 'react';

const analyzeSEO = () => {
  const issues = [];

  // Check for missing title tag
  if (!document.title) {
    issues.push('Missing <title> tag.');
  }

  // Check for meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    issues.push('Missing meta description.');
  } else if (metaDescription.content.length < 50) {
    issues.push(
      'Meta description is too short. (Minimum 50 characters recommended)'
    );
  }

  // Check for missing alt attributes on images
  const imagesWithoutAlt = Array.from(document.querySelectorAll('img')).filter(
    (img) => !img.alt
  );
  if (imagesWithoutAlt.length > 0) {
    issues.push(
      `Found ${imagesWithoutAlt.length} images without alt attributes.`
    );
  }

  // Check for missing canonical link
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    issues.push('Missing canonical link.');
  }

  // Check for missing h1 tag
  const h1Tags = document.querySelectorAll('h1');
  if (h1Tags.length === 0) {
    issues.push('No <h1> tag found.');
  } else if (h1Tags.length > 1) {
    issues.push(
      'Multiple <h1> tags found. Only one <h1> is recommended per page.'
    );
  }

  // Check for internal links without rel attributes
  const linksWithoutRel = Array.from(document.querySelectorAll('a')).filter(
    (link) => link.hostname !== window.location.hostname && !link.rel
  );
  if (linksWithoutRel.length > 0) {
    issues.push(
      `Found ${linksWithoutRel.length} external links without rel="nofollow" or rel="noopener".`
    );
  }

  return issues;
};

const SEOAnalyzer = () => {
  useEffect(() => {
    const issues = analyzeSEO();
    if (issues.length > 0) {
      console.warn('SEO Analyzer Issues:', issues);
    } else {
      console.log('SEO Analyzer: No issues detected.');
    }
  }, []);

  return null;
};

export default SEOAnalyzer;
