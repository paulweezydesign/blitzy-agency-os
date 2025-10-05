import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { RbacService } from '../rbac/rbac.service';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(
    private readonly workspaces: WorkspacesService,
    private readonly rbac: RbacService,
  ) {}

  @Get(':slug')
  @UseGuards(JwtAuthGuard)
  async getWorkspace(@Param('slug') slug: string, @Req() req: AuthenticatedRequest) {
    await this.rbac.ensureWorkspaceAccess({
      userId: req.user?.sub,
      workspaceSlug: slug,
      allowedRoles: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER],
    });

    const workspace = await this.workspaces.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return {
      id: workspace.id,
      slug: workspace.slug,
      name: workspace.name,
      timezone: workspace.timezone,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    } as const;
  }
}
