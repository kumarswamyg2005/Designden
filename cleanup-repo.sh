#!/bin/bash

echo "🧹 Starting repository cleanup..."

# Remove all MD files except README.md
find . -maxdepth 1 -name "*.md" ! -name "README.md" -type f -exec rm -v {} \;

# Remove Vercel configuration
rm -vf vercel.json
rm -rvf .vercel

# Remove unnecessary files
rm -vf cookies.txt
rm -vf debug-add-to-cart-complete.js
rm -vf assign-orders-to-designer.js
rm -vf TEST_ADD_TO_CART.sh
rm -vf test-add-to-cart-debug.js
rm -vf test-designer-db.js
rm -vf setup-team-branches.sh

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Files kept:"
ls -1 *.md 2>/dev/null || echo "  README.md"
echo ""
