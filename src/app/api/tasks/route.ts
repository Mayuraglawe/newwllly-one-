import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { title, description, projectId, assigneeId } = await request.json();

    if (!title || !projectId) {
      return NextResponse.json({ message: 'Title and projectId are required' }, { status: 400 });
    }

    // Verify user has access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const isMemberOrOwner = project.ownerId === userId || project.members.some(m => m.userId === userId);
    if (!isMemberOrOwner) {
      return NextResponse.json({ message: 'Unauthorized for this project' }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        projectId,
        assigneeId: assigneeId || null
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
