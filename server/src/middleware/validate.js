import ApiError from '../utils/ApiError.js';

/**
 * Validates req.body / req.query / req.params against a zod schema.
 * Usage: router.post('/', validate(createItemSchema), controller)
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(' ');
    return next(ApiError.badRequest(message));
  }
  req[source === 'body' ? 'body' : source] = result.data;
  next();
};

export default validate;
