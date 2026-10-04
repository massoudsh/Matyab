export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export const unauthorized = () => new HttpError(401, "احراز هویت لازم است");
export const forbidden = () => new HttpError(403, "دسترسی غیرمجاز است");
export const badRequest = (message: string) => new HttpError(400, message);
export const notFound = (resource: string) => new HttpError(404, `${resource} یافت نشد`);
