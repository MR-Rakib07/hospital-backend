import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodType } from 'zod';

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: unknown; query?: unknown; params?: unknown };

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issue = error.issues[0];
        const field = issue?.path.filter((p) => p !== 'body').join('.');
        const message = field ? `${field}: ${issue.message}` : issue?.message || 'Validation failed';

        res.status(400).json({
          success: false,
          message,
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };
};