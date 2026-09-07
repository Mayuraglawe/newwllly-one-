import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const params = await context.params;
    const body = await request.json();
    const { status, assigneeId, title, description, dueDate } = body;

    const updateData: {
      status?: string;
      assigneeId?: string | null;
      title?: string;
      description?: string | null;
      dueDate?: Date | null;
    } = {};

    if (status !== undefined) updateData.status = status;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId === 'unassigned' || !assigneeId ? null : assigneeId;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    await prisma.task.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
