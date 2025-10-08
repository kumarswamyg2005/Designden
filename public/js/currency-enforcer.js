// STRICT RULE 2: CURRENCY ENFORCEMENT - INR (₹) ONLY - NO EXCEPTIONS
// This utility ensures all prices are ALWAYS displayed in Indian Rupees

class CurrencyEnforcer {
  constructor() {
    this.REQUIRED_CURRENCY = '₹';
    this.FORBIDDEN_CURRENCIES = ['$', '€', '£', '¥', 'USD', 'EUR', 'GBP', 'JPY'];
    this.initialized = false;
  }

  // STRICT VALIDATION: Ensure price is formatted as INR
  enforceINRFormat(price, fallbackPrice = 0) {
    try {
      // VALIDATION: Check for forbidden currencies
      if (typeof price === 'string') {
        for (const forbidden of this.FORBIDDEN_CURRENCIES) {
          if (price.includes(forbidden)) {
            console.error('🚨 RULE 2 VIOLATION: Forbidden currency detected:', forbidden);
            throw new Error(`Currency violation: ${forbidden} not allowed. Only ₹ permitted.`);
          }
        }
      }

      // CONVERT: Ensure number format
      const numericPrice = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.-]/g, ''));
      
      // VALIDATION: Check for valid number
      if (isNaN(numericPrice) || numericPrice < 0) {
        console.warn('⚠️ RULE 2: Invalid price, using fallback:', fallbackPrice);
        return `${this.REQUIRED_CURRENCY}${fallbackPrice.toFixed(2)}`;
      }

      // ENFORCE: Always format as INR
      const formattedPrice = `${this.REQUIRED_CURRENCY}${numericPrice.toFixed(2)}`;
      console.log('✅ RULE 2 ENFORCED: Price formatted as INR:', formattedPrice);
      return formattedPrice;

    } catch (error) {
      console.error('🚨 RULE 2 VIOLATION:', error.message);
      return `${this.REQUIRED_CURRENCY}${fallbackPrice.toFixed(2)}`;
    }
  }

  // STRICT ENFORCEMENT: Scan and fix all price elements on page load
  enforcePageWideCurrency() {
    console.log('🔒 ENFORCING RULE 2: Scanning page for currency violations...');
    
    // Find all elements that might contain prices
    const priceSelectors = [
      '[class*="price"]',
      '[id*="price"]', 
      '[class*="total"]',
      '[id*="total"]',
      '[class*="cost"]',
      '[id*="cost"]'
    ];

    let violationsFound = 0;
    let violationsFixed = 0;

    priceSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent || element.innerHTML;
        
        // Check for violations
        for (const forbidden of this.FORBIDDEN_CURRENCIES) {
          if (text.includes(forbidden)) {
            violationsFound++;
            console.error('🚨 RULE 2 VIOLATION DETECTED:', forbidden, 'in element:', element);
            
            // FIX: Replace with INR format
            const correctedText = text.replace(new RegExp(forbidden, 'g'), this.REQUIRED_CURRENCY);
            element.textContent = correctedText;
            violationsFixed++;
            console.log('✅ RULE 2 VIOLATION FIXED:', correctedText);
          }
        }
      });
    });

    console.log(`🔒 RULE 2 SCAN COMPLETE: ${violationsFound} violations found, ${violationsFixed} fixed`);
  }

  // STRICT ENFORCEMENT: Initialize currency enforcement on page load
  initialize() {
    if (this.initialized) return;
    
    console.log('🔒 INITIALIZING RULE 2: INR Currency Enforcement');
    
    // Immediate enforcement
    this.enforcePageWideCurrency();
    
    // Continuous monitoring
    const observer = new MutationObserver(() => {
      this.enforcePageWideCurrency();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    this.initialized = true;
    console.log('✅ RULE 2 INITIALIZED: Currency enforcement active');
  }
}

// GLOBAL ENFORCEMENT: Make available globally
window.CurrencyEnforcer = new CurrencyEnforcer();

// AUTO-ENFORCEMENT: Start immediately when script loads
document.addEventListener('DOMContentLoaded', () => {
  window.CurrencyEnforcer.initialize();
});

// EXPORT for EJS templates
window.enforceINR = (price, fallback = 0) => {
  return window.CurrencyEnforcer.enforceINRFormat(price, fallback);
};
