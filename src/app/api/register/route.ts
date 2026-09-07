import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    // Determine role: if first user on platform, default to ADMIN, otherwise requested role or MEMBER
    const userCount = await prisma.user.count();
    const assignedRole = userCount === 0 ? 'ADMIN' : (role === 'ADMIN' ? 'ADMIN' : 'MEMBER');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserPayload = {
      name,
      email,
      passwordHash: hashedPassword,
      role: assignedRole,
    };

    const user = await prisma.user.create({
      data: newUserPayload as unknown as Parameters<typeof prisma.user.create>[0]['data'],
    });

    const userObj = user as unknown as { id: string; name: string | null; email: string; role?: string };

    // Return the user without the password hash
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role || assignedRole,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
