#!/bin/bash
# Generate PWA icons using a simple SVG base

SVG_CONTENT='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5B21B6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="102" fill="url(#grad)"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="280" font-weight="bold" fill="white">V</text>
</svg>'

echo "$SVG_CONTENT" > icon.svg
echo "SVG icon created"
