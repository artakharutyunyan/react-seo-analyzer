import React from 'react';
import { render, screen } from '@testing-library/react';
import SEOAnalyzer from './SEOAnalyzer';

// Mock console methods to capture warnings and logs
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SEOAnalyzer Component', () => {
  it('logs SEO issues if found', () => {
    // Mock the document title and meta description for this test
    document.title = '';
    const metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', 'short');
    document.head.appendChild(metaDescription);

    // Render the SEOAnalyzer component
    render(<SEOAnalyzer />);

    // Check that the correct warning message was logged
    expect(console.warn).toHaveBeenCalledWith(
      'SEO Analyzer Issues:',
      expect.arrayContaining([
        'Missing <title> tag.',
        'Meta description is too short. (Minimum 50 characters recommended)',
      ])
    );
  });

  it('logs no issues if everything is correct', () => {
    // Mock correct document title and meta description for this test
    document.title = 'Test Page';
    const metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute(
      'content',
      'This is a valid meta description.'
    );
    document.head.appendChild(metaDescription);

    // Render the SEOAnalyzer component
    render(<SEOAnalyzer />);

    // Check that no issues are logged
    expect(console.log).toHaveBeenCalledWith(
      'SEO Analyzer: No issues detected.'
    );
  });

  it('logs issues for missing alt attributes on images', () => {
    // Set up an image without an alt attribute
    const img = document.createElement('img');
    document.body.appendChild(img);

    // Render the SEOAnalyzer component
    render(<SEOAnalyzer />);

    // Check that the correct warning message was logged
    expect(console.warn).toHaveBeenCalledWith(
      'SEO Analyzer Issues:',
      expect.arrayContaining(['Found 1 images without alt attributes.'])
    );
  });

  it('logs issues for missing canonical link', () => {
    // Ensure there's no canonical link in the document
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.remove();
    }

    // Render the SEOAnalyzer component
    render(<SEOAnalyzer />);

    // Check that the correct warning message was logged
    expect(console.warn).toHaveBeenCalledWith(
      'SEO Analyzer Issues:',
      expect.arrayContaining(['Missing canonical link.'])
    );
  });
});
