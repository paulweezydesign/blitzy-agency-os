import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesService', () => {
  it('delegates to Prisma to look up a workspace by slug', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'w_1', slug: 'acme' });

    const moduleRef = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: PrismaService,
          useValue: {
            workspace: {
              findUnique,
            },
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(WorkspacesService);
    const workspace = await service.findBySlug('acme');

    expect(findUnique).toHaveBeenCalledWith({ where: { slug: 'acme' } });
    expect(workspace).toEqual({ id: 'w_1', slug: 'acme' });
  });
});
