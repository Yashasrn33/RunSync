import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });
    
    // Clear the session cookie
    response.cookies.set('session', '', { 
      httpOnly: true, 
      secure: false,
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
