import { NotFoundException } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { RbacService } from '../rbac/rbac.service';

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(() => jest.fn()),
}));

function createRequest(userId: string) {
  return {
    user: {
      sub: userId,
      permissions: [WorkspaceRole.MEMBER],
    },
  } as any;
}

describe('WorkspacesController', () => {
  it('returns sanitized workspace response when authorized', async () => {
    const workspacesService: Partial<WorkspacesService> = {
      findBySlug: jest.fn().mockResolvedValue({
        id: 'w_1',
        slug: 'acme',
        name: 'Acme Agency',
        timezone: 'UTC',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        secretColumn: 'should-not-leak',
      }),
    };

    const rbacService: Partial<RbacService> = {
      ensureWorkspaceAccess: jest.fn().mockResolvedValue({
        role: WorkspaceRole.ADMIN,
      }),
    };

    const controller = new WorkspacesController(
      workspacesService as WorkspacesService,
      rbacService as RbacService,
    );

    await expect(controller.getWorkspace('acme', createRequest('user_1'))).resolves.toEqual({
      id: 'w_1',
      slug: 'acme',
      name: 'Acme Agency',
      timezone: 'UTC',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    });
  });

  it('throws when workspace missing', async () => {
    const workspacesService: Partial<WorkspacesService> = {
      findBySlug: jest.fn().mockResolvedValue(null),
    };

    const rbacService: Partial<RbacService> = {
      ensureWorkspaceAccess: jest.fn().mockResolvedValue({
        role: WorkspaceRole.MEMBER,
      }),
    };

    const controller = new WorkspacesController(
      workspacesService as WorkspacesService,
      rbacService as RbacService,
    );

    await expect(controller.getWorkspace('missing', createRequest('user_1'))).rejects.toThrow(
      NotFoundException,
    );
  });
});
