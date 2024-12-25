// Post creation validation
interface CreatePostRequest {
 title: string;
 body: string;
 tags: string[];
 status: 'draft' | 'published';
}

export const validateCreatePost = (data: CreatePostRequest) => {
 const errors: string[] = [];

 if (!data.title?.trim()) {
  errors.push('Title is required and cannot be empty');
 }

 if (data.title && data.title.length > 100) {
  errors.push('Title must be less than 100 characters');
 }

 if (!data.body?.trim()) {
  errors.push('Body is required and cannot be empty');
 }

 if (!['draft', 'published'].includes(data.status)) {
  errors.push('Status must be either draft or published');
 }

 if (!Array.isArray(data.tags)) {
  errors.push('Tags must be an array');
 } else {
  if (data.tags.length > 10) {
   errors.push('Maximum 10 tags allowed');
  }

  const invalidTags = data.tags.filter(
   (tag) =>
    typeof tag !== 'string' || tag.trim().length === 0 || tag.trim().length > 30
  );

  if (invalidTags.length > 0) {
   errors.push(
    'Tags must be non-empty strings with maximum length of 30 characters'
   );
  }
 }

 return errors;
};

// Pagination validation
interface PaginationQuery {
 page?: string;
 limit?: string;
}

export const validatePagination = (query: PaginationQuery) => {
 const pageNumber = parseInt(query.page || '1', 10);
 const limitNumber = parseInt(query.limit || '10', 10);

 const errors: string[] = [];

 if (Number.isNaN(pageNumber) || pageNumber < 1) {
  errors.push('Page must be a positive number');
 }

 if (Number.isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
  errors.push('Limit must be between 1 and 100');
 }

 return {
  errors,
  pageNumber,
  limitNumber,
 };
};

// Post ID validation
export const validatePostId = (id: string) => {
 const parsedId = parseInt(id, 10);
 if (Number.isNaN(parsedId) || parsedId < 1) {
  return { error: 'Invalid post ID. Must be a positive number' };
 }
 return { parsedId };
};
