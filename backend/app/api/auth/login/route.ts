import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, isSignUp } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    if (isSignUp) {
      // Sign up flow
      if (!firstName || !lastName) {
        return NextResponse.json({ message: "First name and last name required for signup" }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json({ message: "User already exists" }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName
        }
      });

      // Set session cookie
      const response = NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      });

      response.cookies.set('session', user.id, { 
        httpOnly: true, 
        secure: false, // Set to true in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    } else {
      // Sign in flow
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.password) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      // Set session cookie
      const response = NextResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      });

      response.cookies.set('session', user.id, { 
        httpOnly: true, 
        secure: false, // Set to true in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return NextResponse.json({ message: "Authentication failed" }, { status: 500 });
  }
}
