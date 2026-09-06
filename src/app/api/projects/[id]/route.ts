import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const userId = (session.user as { id: string }).id;

    const project = await prisma.project.findUnique({
      where: { id: params.id }
    });

    if (!project || project.ownerId !== userId) {
      return NextResponse.json({ message: 'Only the project owner can delete this project' }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
