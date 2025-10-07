HARSHACHANGES - Edits by K. Harsha Vardhan

This file records small, safe changes made to the asynchronous cart system and related files.

Changes:
- models/cart.js: added pre-save hook to refresh `updatedAt` on save for timestamp consistency.
- routes/customer.js: normalized `quantity` and added safer defaults + improved logging in `/add-to-cart` route.
- views/customer/cart.ejs: added a small comment noting backend updates.

These are minor reliability and observability improvements attributed to Harsha Vardhan.

Additional note: comments were added to routes and views to improve traceability.
