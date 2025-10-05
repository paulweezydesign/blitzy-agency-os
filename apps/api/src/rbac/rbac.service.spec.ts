import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RbacService } from './rbac.service';

describe('RbacService', () => {
  function createModule(mock: Partial<PrismaService>) {
    return Test.createTestingModule({
      providers: [
        RbacService,
        {
          provide: PrismaService,
          useValue: mock,
        },
      ],
    }).compile();
  }

  it('throws when user context missing', async () => {
    const moduleRef = await createModule({});
    const service = moduleRef.get(RbacService);

    await expect(
      service.ensureWorkspaceAccess({
        userId: undefined,
        workspaceSlug: 'acme',
        allowedRoles: [WorkspaceRole.MEMBER],
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws when membership not found', async () => {
    const moduleRef = await createModule({
      workspaceMember: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService);

    const service = moduleRef.get(RbacService);

    await expect(
      service.ensureWorkspaceAccess({
        userId: 'user_1',
        workspaceSlug: 'missing',
        allowedRoles: [WorkspaceRole.ADMIN],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when role insufficient', async () => {
    const moduleRef = await createModule({
      workspaceMember: {
        findFirst: jest.fn().mockResolvedValue({
          role: WorkspaceRole.MEMBER,
          workspace: { id: 'w_1' },
        }),
      },
    } as unknown as PrismaService);

    const service = moduleRef.get(RbacService);

    await expect(
      service.ensureWorkspaceAccess({
        userId: 'user_1',
        workspaceSlug: 'acme',
        allowedRoles: [WorkspaceRole.ADMIN],
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('returns membership when role allowed', async () => {
    const membership = {
      role: WorkspaceRole.ADMIN,
      workspace: { id: 'w_1' },
    };

    const moduleRef = await createModule({
      workspaceMember: {
        findFirst: jest.fn().mockResolvedValue(membership),
      },
    } as unknown as PrismaService);

    const service = moduleRef.get(RbacService);

    await expect(
      service.ensureWorkspaceAccess({
        userId: 'user_1',
        workspaceSlug: 'acme',
        allowedRoles: [WorkspaceRole.ADMIN, WorkspaceRole.OWNER],
      }),
    ).resolves.toBe(membership);
  });
});
