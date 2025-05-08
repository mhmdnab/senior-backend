// middleware/errorMiddleware.ts

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  // Removed internal console.log statements

  // Set status code, default to 500 if it's still 200
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode); // Send JSON response with error message and stack trace (in non-production)

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export const notFound = (req: any, res: any, next: any) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
