import { NextRequest, NextResponse } from "next/server";

// GET /api/endpoints - List all available endpoints
export async function GET(request: NextRequest) {
  const endpoints = [
    {
      path: "/api/users",
      methods: ["GET", "POST", "PUT", "DELETE"],
      description: "User management",
      examples: {
        GET: "Get all users with filters: ?role=admin&divisi_id=1",
        POST: "Create new user",
        PUT: "Update user (requires id_user in body)",
        DELETE: "Delete user (requires id_user in body)",
      },
    },
    {
      path: "/api/users/[id]",
      methods: ["GET", "PUT", "DELETE"],
      description: "Specific user operations",
      examples: {
        GET: "Get user by ID with relations",
        PUT: "Update specific user",
        DELETE: "Delete specific user",
      },
    },
    {
      path: "/api/absensi",
      methods: ["GET", "POST", "PUT", "DELETE"],
      description: "Attendance management",
      examples: {
        GET: "Get attendance records: ?user_id=1&tanggal=2025-08-31&status=hadir",
        POST: "Create attendance record",
        PUT: "Update attendance (requires id_absensi)",
        DELETE: "Delete attendance (requires id_absensi)",
      },
    },
    {
      path: "/api/cuti",
      methods: ["GET", "POST", "PUT", "DELETE"],
      description: "Leave request management",
      examples: {
        GET: "Get leave requests: ?user_id=1&status=pending",
        POST: "Create leave request",
        PUT: "Update leave request (requires id)",
        DELETE: "Delete leave request (requires id)",
      },
    },
    {
      path: "/api/laporan",
      methods: ["GET", "POST", "PUT", "DELETE"],
      description: "Report management",
      examples: {
        GET: "Get reports: ?user_id=1&limit=10",
        POST: "Create report",
        PUT: "Update report (requires id)",
        DELETE: "Delete report (requires id)",
      },
    },
    {
      path: "/api/divisi",
      methods: ["GET", "POST", "PUT", "DELETE"],
      description: "Division management",
      examples: {
        GET: "Get divisions: ?include_users=true",
        POST: "Create division",
        PUT: "Update division (requires id_divisi)",
        DELETE: "Delete division (requires id_divisi)",
      },
    },
    {
      path: "/api/ip-lokasi",
      methods: ["GET", "POST", "PUT", "DELETE"],
      description: "IP location management",
      examples: {
        GET: "Get IP locations: ?ip=192.168&lokasi=kantor",
        POST: "Create IP location",
        PUT: "Update IP location (requires id)",
        DELETE: "Delete IP location (requires id)",
      },
    },
    {
      path: "/api/get-ip",
      methods: ["GET"],
      description: "Get client IP with network validation",
      examples: {
        GET: "Returns IP address and network info for attendance validation",
      },
    },
    {
      path: "/api/debug-ip",
      methods: ["GET"],
      description: "Debug IP detection",
      examples: {
        GET: "Shows all IP-related headers for debugging",
      },
    },
  ];

  return NextResponse.json({
    success: true,
    message: "Available API endpoints",
    baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    endpoints: endpoints,
    totalEndpoints: endpoints.length,
    usage: {
      note: "All endpoints return JSON responses",
      errorFormat: '{ success: false, error: "Error message" }',
      successFormat:
        '{ success: true, data: {...}, message?: "Success message" }',
    },
  });
}
