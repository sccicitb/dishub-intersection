# TODO: Implement Submenu in Menu Structure

## Completed Tasks
- [x] Restructure menu.json to include groups with children (submenus)
  - Grouped survey items under "Survei"
  - Grouped management items under "Manajemen"
  - Grouped SA forms under "Form SA"
- [x] Update layoutMain.js to support submenu rendering
  - Added state for expandedGroups to track open/closed groups
  - Modified filterMenuByRole to handle children filtering based on user roles
  - Updated menu rendering logic to display groups with expandable children
  - Added icons for expand/collapse (AiOutlineDown, AiOutlineRight)
- [x] Ensure role-based access control works for submenu items
- [x] Maintain existing styling and functionality for regular menu items

## Summary
The menu structure has been successfully updated to support submenus. Users can now click on group headers (Survei, Manajemen, Form SA) to expand/collapse their respective submenu items. The layout adjusts accordingly, and role-based access is preserved for both group items and their children.
