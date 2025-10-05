import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface WorkspaceAccessOptions {
  userId?: string;
  workspaceSlug: string;
  allowedRoles: WorkspaceRole[];
}

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureWorkspaceAccess(options: WorkspaceAccessOptions) {
    const { userId, workspaceSlug, allowedRoles } = options;

    if (!userId) {
      throw new ForbiddenException('User context missing');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspace: { slug: workspaceSlug },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Workspace membership not found');
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions for workspace');
    }

    return membership;
  }

  async listWorkspaceMembers(workspaceId: string, select?: Prisma.WorkspaceMemberSelect) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      select,
    });
  }
}
