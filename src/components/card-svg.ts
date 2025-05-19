export function getCardImage(): string {
  return `<svg width="300" height="190" xmlns="http://www.w3.org/2000/svg">
            <!-- Gradient Background -->
            <defs>
              <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1A1F71;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#6A0DAD;stop-opacity:1" />
              </linearGradient>
            </defs>
            
            <!-- Card Background -->
            <rect x="10" y="10" width="280" height="170" rx="10" fill="url(#cardGradient)" stroke="#000" stroke-width="2"/>
  
            <!-- Visa Logo -->
            <text x="230" y="40" font-family="Arial" font-size="20" font-weight="bold" fill="#FFFFFF" stroke="#000" stroke-width="0.5">VISA</text>
  
            <!-- Main Brand Name -->
            <text x="20" y="80" font-family="Arial" font-size="24" font-weight="bold" fill="#FFFFFF" stroke="#000" stroke-width="0.5">UbiquiCard</text>
  
            <!-- Card Number -->
            <text x="20" y="120" font-family="Arial" font-size="16" fill="#FFFFFF" stroke="#000" stroke-width="0.5">1234 5678 9012 3456</text>
  
            <!-- Name -->
            <text x="20" y="150" font-family="Arial" font-size="14" fill="#FFFFFF" stroke="#000" stroke-width="0.5">Mr. Awesome</text>
  
            <!-- Powered by WirexPayChain -->
            <text x="20" y="170" font-family="Arial" font-size="10" fill="#FFFFFF" stroke="#000" stroke-width="0.3">Powered by WirexPayChain</text>
          </svg>
      `;
}
