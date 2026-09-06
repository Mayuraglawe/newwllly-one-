import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const userId = (session.user as { id: string }).id;
    const { email } = await request.json();

    if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });

    const project = await prisma.project.findUnique({
      where: { id: params.id }
    });

    if (!project || project.ownerId !== userId) {
      return NextResponse.json({ message: 'Only the project owner can invite members' }, { status: 403 });
    }

    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) {
      return NextResponse.json({ message: 'User with this email not found' }, { status: 404 });
    }

    const existingMember = await prisma.projectMember.findFirst({
      where: { projectId: params.id, userId: invitee.id }
    });

    if (existingMember) {
      return NextResponse.json({ message: 'User is already a member' }, { status: 400 });
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId: params.id,
        userId: invitee.id,
        role: 'MEMBER'
      },
      include: { user: { select: { name: true, email: true } } }
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
