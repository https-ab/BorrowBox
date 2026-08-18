/** Parses ?page=&limit= into safe skip/limit values. */
export function getPagination(query, defaults = { page: 1, limit: 12, maxLimit: 50 }) {
  const page = Math.max(1, parseInt(query.page, 10) || defaults.page);
  const limit = Math.min(defaults.maxLimit, Math.max(1, parseInt(query.limit, 10) || defaults.limit));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginatedResponse(items, total, page, limit) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: page * limit < total,
    },
  };
}
