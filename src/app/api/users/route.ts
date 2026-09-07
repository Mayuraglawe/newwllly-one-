import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch registered users (excluding password hash)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
