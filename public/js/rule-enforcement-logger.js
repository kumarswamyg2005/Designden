// 🔒 STRICT RULE ENFORCEMENT LOGGING SYSTEM
// This system monitors and reports any violations of the 5 strict rules

class RuleEnforcementLogger {
  constructor() {
    this.violations = [];
    this.rules = {
      1: "3D Model Consistency",
      2: "INR Currency Display", 
      3: "Product Photo Consistency",
      4: "Price Consistency",
      5: "City Name Preservation"
    };
    this.initialized = false;
  }

  // Log a rule violation
  logViolation(ruleNumber, message, details = {}) {
    const violation = {
      rule: ruleNumber,
      ruleName: this.rules[ruleNumber],
      message: message,
      details: details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.violations.push(violation);
    
    console.error(`🚨 RULE ${ruleNumber} VIOLATION:`, message);
    console.error('📋 Violation Details:', details);
    console.error('🔗 Page URL:', window.location.href);
    
    // Send to server for logging (optional)
    this.sendViolationToServer(violation);
  }

  // Log successful rule enforcement
  logSuccess(ruleNumber, message, details = {}) {
    console.log(`✅ RULE ${ruleNumber} ENFORCED:`, message);
    console.log('📋 Success Details:', details);
  }

  // Send violation to server
  async sendViolationToServer(violation) {
    try {
      // Only send critical violations to avoid spam
      if (this.isCriticalViolation(violation)) {
        await fetch('/api/rule-violations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(violation)
        });
      }
    } catch (error) {
      console.warn('Could not send violation to server:', error);
    }
  }

  // Check if violation is critical
  isCriticalViolation(violation) {
    const criticalKeywords = ['MISSING', 'INVALID', 'FAILED', 'ERROR', 'NULL', 'UNDEFINED'];
    return criticalKeywords.some(keyword => 
      violation.message.toUpperCase().includes(keyword)
    );
  }

  // Generate compliance report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalViolations: this.violations.length,
      violationsByRule: {},
      criticalViolations: this.violations.filter(v => this.isCriticalViolation(v)),
      summary: {}
    };

    // Count violations by rule
    for (let i = 1; i <= 5; i++) {
      report.violationsByRule[i] = this.violations.filter(v => v.rule === i).length;
    }

    // Generate summary
    report.summary = {
      rule1: report.violationsByRule[1] === 0 ? '✅ COMPLIANT' : `❌ ${report.violationsByRule[1]} violations`,
      rule2: report.violationsByRule[2] === 0 ? '✅ COMPLIANT' : `❌ ${report.violationsByRule[2]} violations`,
      rule3: report.violationsByRule[3] === 0 ? '✅ COMPLIANT' : `❌ ${report.violationsByRule[3]} violations`,
      rule4: report.violationsByRule[4] === 0 ? '✅ COMPLIANT' : `❌ ${report.violationsByRule[4]} violations`,
      rule5: report.violationsByRule[5] === 0 ? '✅ COMPLIANT' : `❌ ${report.violationsByRule[5]} violations`
    };

    console.group('🔒 RULE ENFORCEMENT COMPLIANCE REPORT');
    console.log('📊 Total Violations:', report.totalViolations);
    console.log('📋 Rule Compliance Status:');
    console.log('   Rule 1 (3D Models):', report.summary.rule1);
    console.log('   Rule 2 (Currency):', report.summary.rule2);
    console.log('   Rule 3 (Photos):', report.summary.rule3);
    console.log('   Rule 4 (Prices):', report.summary.rule4);
    console.log('   Rule 5 (Cities):', report.summary.rule5);
    console.log('🚨 Critical Violations:', report.criticalViolations.length);
    console.groupEnd();

    return report;
  }

  // Initialize monitoring
  initialize() {
    if (this.initialized) return;

    console.log('🔒 INITIALIZING RULE ENFORCEMENT MONITORING');
    console.log('📋 Monitoring Rules:');
    Object.entries(this.rules).forEach(([num, name]) => {
      console.log(`   Rule ${num}: ${name}`);
    });

    // Monitor for dynamic content changes
    const observer = new MutationObserver(() => {
      this.validatePageCompliance();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Validate on page load
    this.validatePageCompliance();

    // Generate report every 30 seconds
    setInterval(() => {
      if (this.violations.length > 0) {
        this.generateReport();
      }
    }, 30000);

    this.initialized = true;
    console.log('✅ RULE ENFORCEMENT MONITORING ACTIVE');
  }

  // Validate current page compliance
  validatePageCompliance() {
    // Check for currency violations
    this.checkCurrencyCompliance();
    
    // Check for image loading errors
    this.checkImageCompliance();
    
    // Check for price consistency
    this.checkPriceCompliance();
  }

  // Check currency compliance
  checkCurrencyCompliance() {
    const forbiddenCurrencies = ['$', '€', '£', '¥', 'USD', 'EUR', 'GBP', 'JPY'];
    const textContent = document.body.textContent || '';
    
    forbiddenCurrencies.forEach(currency => {
      if (textContent.includes(currency)) {
        this.logViolation(2, `Forbidden currency detected: ${currency}`, {
          currency: currency,
          location: 'page-text'
        });
      }
    });
  }

  // Check image compliance
  checkImageCompliance() {
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (img.src.includes('placeholder') && !img.hasAttribute('data-fallback-ok')) {
        this.logViolation(3, 'Placeholder image detected without proper fallback', {
          src: img.src,
          alt: img.alt,
          index: index
        });
      }
    });
  }

  // Check price compliance
  checkPriceCompliance() {
    const priceElements = document.querySelectorAll('[class*="price"], [id*="price"], [class*="total"], [id*="total"]');
    priceElements.forEach((element, index) => {
      const text = element.textContent || '';
      if (!text.includes('₹') && (text.includes('$') || /\d+\.\d{2}/.test(text))) {
        this.logViolation(4, 'Price element without INR symbol', {
          text: text,
          element: element.tagName,
          class: element.className,
          index: index
        });
      }
    });
  }
}

// Global instance
window.RuleLogger = new RuleEnforcementLogger();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.RuleLogger.initialize();
});

// Export for use in templates
window.logViolation = (rule, message, details) => {
  window.RuleLogger.logViolation(rule, message, details);
};

window.logSuccess = (rule, message, details) => {
  window.RuleLogger.logSuccess(rule, message, details);
};
