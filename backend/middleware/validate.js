/**
 * Generic request-validation middleware factory.
 *
 * Validates `req[source]` against a zod schema. On success the parsed
 * value replaces the original so handlers receive cleaned data;
 * on failure it short-circuits with a 400 listing every issue.
 *
 * @param {import('zod').ZodType} schema - zod schema to validate against.
 * @param {'body'|'query'|'params'} [source='body'] - which request property to validate.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || source}: ${issue.message}`)
      .join('; ');

    return res.status(400).json({
      success: false,
      message: 'Invalid request',
      error: message,
    });
  }

  req[source] = result.data;
  return next();
};

module.exports = validate;
