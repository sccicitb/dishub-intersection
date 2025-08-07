# API Endpoints Audit - Authentication & Authorization Required

## Overview
This document lists all existing API endpoints that need to be protected with authentication and role-based authorization middleware.

## 🔒 **Camera Management Endpoints**

### Camera CRUD Operations
| Method | Endpoint | Description | Required Role | Protection Level | Required Roles |
|--------|----------|-------------|---------------|------------------|----------------|
| GET | `/api/cameras` | List all cameras | viewer+ | Authentication Required | - |
| GET | `/api/cameras/:id` | Get single camera | viewer+ | Authentication Required | - |
| POST | `/api/cameras` | Create new camera | operator+ | Authentication + Role Check | operator, admin |
| PUT | `/api/cameras/:id` | Update camera | operator+ | Authentication + Role Check | operator, admin |
| DELETE | `/api/cameras/:id` | Delete camera | admin | Authentication + Admin Role | admin |

### Camera Status Management
| Method | Endpoint | Description | Required Role | Protection Level | Required Roles |
|--------|----------|-------------|---------------|------------------|----------------|
| POST | `/api/cameras/status-log` | Create camera status log | operator+ | Authentication + Role Check | operator, admin |
| GET | `/api/cameras/:id/status-log` | Get camera status logs | viewer+ | Authentication Required | - |
| GET | `/api/cameras/status-latest` | Get latest camera status | viewer+ | Authentication Required | - |
| GET | `/api/cameras/down-today` | Get cameras down today | viewer+ | Authentication Required | - |

---

## 📊 **Survey Management Endpoints**

### Survey Data & Analytics
| Method | Endpoint | Description | Required Role | Protection Level | Required Roles |
|--------|----------|-------------|---------------|------------------|----------------|
| GET | `/api/surveys/data-summary` | Get vehicle summary data | viewer+ | Authentication Required | - |
| GET | `/api/surveys/export-vehicle` | Export vehicle data | operator+ | Authentication + Role Check | operator, admin |
| GET | `/api/survey-proporsi` | Get survey proportions | viewer+ | Authentication Required | - |
| GET | `/api/surveys/km-tabel` | Get KM table data | viewer+ | Authentication Required | - |

---

## 🚗 **Vehicle Data Endpoints**

### Vehicle Analytics & Reports
| Method | Endpoint | Description | Required Role | Protection Level | Required Roles |
|--------|----------|-------------|---------------|------------------|----------------|
| GET | `/api/vehicles` | Get all vehicles | viewer+ | Authentication Required | - |
| GET | `/api/vehicles/getChartMasukKeluar` | Get entry/exit chart data | viewer+ | Authentication Required | - |
| GET | `/api/vehicles/getGroupTipeKendaraan` | Get vehicle type groups | viewer+ | Authentication Required | - |
| GET | `/api/vehicles/getMasukKeluarByArah` | Get entry/exit by direction | viewer+ | Authentication Required | - |
| GET | `/api/vehicles/getRataPerJam` | Get hourly averages | viewer+ | Authentication Required | - |
| GET | `/api/vehicles/getRataPer15Menit` | Get 15-minute averages | viewer+ | Authentication Required | - |

---

## 📅 **Holiday Management Endpoints**

### Holiday CRUD Operations
| Method | Endpoint | Description | Required Role | Protection Level | Required Roles |
|--------|----------|-------------|---------------|------------------|----------------|
| GET | `/api/holidays` | Get paginated holidays | viewer+ | Authentication Required | - |
| POST | `/api/holidays` | Create new holiday | admin | Authentication + Admin Role | admin |
| PUT | `/api/holidays/:id` | Update holiday | admin | Authentication + Admin Role | admin |
| DELETE | `/api/holidays/:id` | Delete holiday | admin | Authentication + Admin Role | admin |
| POST | `/api/holidays/import` | Import holiday data | admin | Authentication + Admin Role | admin |

---

## 🗺️ **Maps Management Endpoints**

### Maps & Building Data
| Method | Endpoint | Description | Required Role | Protection Level | Required Roles |
|--------|----------|-------------|---------------|------------------|----------------|
| GET | `/api/maps/buildings` | Get buildings raw data | viewer+ | Authentication Required | - |
| GET | `/api/maps/cameras` | Get all cameras raw data | viewer+ | Authentication Required | - |
| GET | `/api/maps/buildings-full` | Get buildings with cameras | viewer+ | Authentication Required | - |

---

## 🚦 **Simpang (Intersection) Management Endpoints**

### Intersection CRUD Operations
| Method | Endpoint | Description | Required Role | Protection Level | Required Roles |
|--------|----------|-------------|---------------|------------------|----------------|
| GET | `/api/simpang` | List all intersections | viewer+ | Authentication Required | - |
| GET | `/api/simpang/:id` | Get intersection by ID | viewer+ | Authentication Required | - |
| GET | `/api/simpang/:id/detail` | Get intersection detail with cameras | viewer+ | Authentication Required | - |
| POST | `/api/simpang` | Create new intersection | admin | Authentication + Admin Role | admin |
| PUT | `/api/simpang/:id` | Update intersection | admin | Authentication + Admin Role | admin |
| DELETE | `/api/simpang/:id` | Delete intersection | admin | Authentication + Admin Role | admin |
| GET | `/api/simpang/:id/cameras` | Get cameras by intersection | viewer+ | Authentication Required | - |

---

## 🔐 **Role Definitions**

### Viewer Role (viewer+)
- **Access**: Read-only access to all data
- **Endpoints**: All GET endpoints for viewing data
- **Use Case**: Dashboard viewing, report generation

### Operator Role (operator+)
- **Access**: Viewer + camera and survey management
- **Endpoints**: All viewer endpoints + camera/survey CRUD
- **Use Case**: Field operators, camera maintenance

### Admin Role (admin)
- **Access**: Full system access + user management
- **Endpoints**: All endpoints + user/role management
- **Use Case**: System administrators, user management

---

## 📋 **Implementation Priority**

### High Priority (Critical Security)
1. **User Management** - Already protected ✅
2. **Holiday Management** - Admin only operations
3. **Intersection Management** - Admin only operations
4. **Camera Management** - Mixed access levels

### Medium Priority (Data Protection)
1. **Survey Data** - Sensitive analytics data
2. **Vehicle Data** - Traffic analytics
3. **Maps Data** - Infrastructure information

### Low Priority (Read-only Data)
1. **Status Logs** - Operational data
2. **Analytics** - Dashboard data

---

## 🎯 **Total Endpoints to Protect**

- **Camera Endpoints**: 9 endpoints
- **Survey Endpoints**: 4 endpoints  
- **Vehicle Endpoints**: 6 endpoints
- **Holiday Endpoints**: 5 endpoints
- **Maps Endpoints**: 3 endpoints
- **Simpang Endpoints**: 7 endpoints

**Total: 34 endpoints need authentication/authorization**

---

## 📊 **Role Check Summary**

### Endpoints Requiring Role Checks
- **Camera Management**: 3 endpoints (operator, admin)
- **Survey Management**: 1 endpoint (operator, admin)
- **Holiday Management**: 4 endpoints (admin only)
- **Simpang Management**: 3 endpoints (admin only)

**Total: 11 endpoints require specific role checks**

### Role Distribution
- **viewer**: 23 endpoints (read-only access)
- **operator**: 4 endpoints (camera/survey management)
- **admin**: 11 endpoints (full system access)

---

## ⚠️ **Special Considerations**

### Public Endpoints (No Protection Needed)
- None identified - all endpoints should be protected

### File Upload Endpoints
- `/api/holidays/import` - File upload with multer middleware

### Pagination Support
- `/api/holidays` - Supports `?page=&limit=` parameters

### Complex Queries
- Vehicle analytics endpoints with complex aggregations
- Survey data with multiple joins
- Camera status with time-based filtering 