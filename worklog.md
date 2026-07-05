---
Task ID: fix-upload-and-categories
Agent: Main Agent
Task: Fix image upload bug and add category management to admin panel

Work Log:
- Fixed U() function in data.ts to handle /uploads/ local paths (was converting them to broken Unsplash URLs)
- Added resolveImg() helper function for inline image resolution
- Fixed 4 places in BachatBazarApp.tsx where inline regex URL checks broke /uploads/ paths
- Fixed store's addProduct to properly resolve images when using uploaded files
- Added full Category management to admin panel: Add, Edit, Delete with image upload support
- Added Categories tab to admin panel with grid layout showing icons, images, edit/delete buttons
- Added Category dialog with: name, icon selector, gradient color selector, image upload/URL
- Added "Add Category" to dashboard quick actions and categories count card
- Bumped store version to v6 to force fresh localStorage
- Verified all changes with lint (0 errors) and agent browser testing

Stage Summary:
- Image uploads now work correctly - /uploads/ paths are preserved, not converted to Unsplash URLs
- Admin can now add, edit, and delete categories with image upload support
- Categories tab visible in admin panel with full CRUD
- Category visibility on homepage rated 9/10 by VLM analysis
