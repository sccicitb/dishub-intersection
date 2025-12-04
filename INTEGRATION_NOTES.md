// INTEGRATION SUMMARY: Traffic Matrix API Integration

/**
 * ✅ COMPLETED INTEGRATION STEPS:
 * 
 * 1. Created useTrafficMatrix Hook (frontend/src/hooks/useTrafficMatrix.js)
 *    - Manages traffic matrix data fetching from backend API
 *    - Handles loading states and error handling
 *    - Provides fallback to default/example data on failure
 *    - Transforms API response to component-ready format
 * 
 * 2. Updated TableMatrix Component (frontend/src/app/components/table/tableMatrix.js)
 *    - Added loading state UI with spinner
 *    - Added error state UI with error message
 *    - Added empty state UI when no data available
 *    - Fixed: arahPergerakan now uses correct data (was incorrectly using asalTujuan)
 * 
 * 3. Updated Page Component (frontend/src/app/page.js)
 *    - Imported useTrafficMatrix hook
 *    - Removed duplicate state management
 *    - Removed duplicate API fetch logic
 *    - Integrated hook into component lifecycle
 *    - Added useEffect to fetch data when selectedLocation or dates change
 *    - Updated TableMatrix props to include loading and error states
 * 
 * API ENDPOINT:
 * - Route: GET /api/vehicles/traffic-matrix
 * - Query Parameters: simpang_id, start_date, end_date
 * - Response Structure:
 *   {
 *     success: boolean,
 *     message: string,
 *     data: {
 *       simpang_id: number,
 *       date_range: { start_date: string, end_date: string },
 *       asalTujuan: { [direction]: { [direction]: number } },
 *       arahPergerakan: { [direction]: { [direction]: number } }
 *     }
 *   }
 * 
 * FLOW DIAGRAM:
 * 1. Page loads → loadDefaultMatrix() loads example data
 * 2. User selects location & dates → fetchTrafficMatrix() called
 * 3. Hook fetches from API
 * 4. On success → Update dataChord & dataMatrix
 * 5. On failure → Use default data as fallback
 * 6. TableMatrix renders with loading/error/data states
 * 
 * TESTING CHECKLIST:
 * ✓ Hook created and exported correctly
 * ✓ No TypeScript/JavaScript errors
 * ✓ Component props updated
 * ✓ Loading state UI added
 * ✓ Error state UI added
 * ✓ Empty state UI added
 * ✓ Fallback logic implemented
 * ✓ Date format validation in API
 * 
 * TO TEST IN BROWSER:
 * 1. Navigate to main page
 * 2. Should see default matrix data on load
 * 3. Select a location and date range
 * 4. Should fetch from API and display data
 * 5. Loading spinner should appear during fetch
 * 6. Error message should appear if API fails
 */
