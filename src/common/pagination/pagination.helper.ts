import { PaginationQueryDto } from './pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function getSkipTake(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  query: PaginationQueryDto,
): PaginatedResult<T> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: totalPages === 0 ? 1 : totalPages,
    },
  };
}
