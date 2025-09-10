import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Try to get IP from external services
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://httpbin.org/ip'
    ];

    for (const service of ipServices) {
      try {
        const response = await fetch(service, {
          // Remove timeout, use signal instead
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Different services return IP in different formats
          let clientIP = data.ip || data.origin || data.query;
          
          if (clientIP) {
            console.log(`Got IP from ${service}:`, clientIP);
            
            return NextResponse.json({
              ip: clientIP,
              success: true,
              source: service,
            });
          }
        }
      } catch (serviceError) {
        console.log(`Failed to get IP from ${service}:`, serviceError);
        continue;
      }
    }

    // If external services fail, fallback to headers
    const forwarded = request.headers.get("x-forwarded-for");
    const clientIP = forwarded?.split(",")[0]?.trim() || "unknown";

    return NextResponse.json({
      ip: clientIP,
      success: true,
      source: "headers",
    });

  } catch (error) {
    console.error("Error getting real IP:", error);
    return NextResponse.json(
      {
        error: "Failed to get IP address",
        success: false,
      },
      { status: 500 }
    );
  }
}