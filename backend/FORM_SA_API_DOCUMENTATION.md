# Form SA API Documentation

## Overview
This document provides comprehensive API documentation for all Form SA (SA-I through SA-V) endpoints implemented in the traffic intersection analysis system.

## 📋 **REQUIREMENTS MAPPING**

This API documentation directly supports the frontend requirements from `Requirements.md`:

### **Frontend Requirements → API Endpoints**

#### **1. Survey Header Requirements**

**Frontend Requirement**: Survey header with date, location, period selection
**API Endpoints**:
- `POST /api/sa-surveys/headers` - Create survey header
- `GET /api/sa-surveys/headers` - Get all survey headers
- `GET /api/sa-surveys/headers/:id` - Get specific survey header
- `PUT /api/sa-surveys/headers/:id` - Update survey header
- `DELETE /api/sa-surveys/headers/:id` - Delete survey header

**Payload Structure**:
```json
{
  "simpang_id": 1,
  "tanggal": "2025-01-15",
  "perihal": "Traffic analysis for intersection optimization",
  "status": "draft"
}
```

#### **2. Form Data Management**

**Frontend Requirement**: Multiple forms (SA-I to SA-V) for same survey header
**API Endpoints**:
- `GET /api/sa-surveys/headers/:id/forms` - Get all forms for a header
- `POST /api/sa-surveys/headers/:id/forms` - Add form to existing header

**Payload Structure**:
```json
{
  "form_type": "SA-I",
  "status": "draft"
}
``` 