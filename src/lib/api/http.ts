import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Envuelve un handler: convierte HttpError en su código y todo lo demás en 500. */
export const handle = async (fn: () => Promise<Response>): Promise<Response> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const readJson = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "El cuerpo de la petición no es JSON válido");
  }
};

/** Lanza 500 con el mensaje de PostgREST si la consulta falló. */
export const orThrow = <T>(result: { data: T; error: { message: string } | null }): T => {
  if (result.error) throw new HttpError(500, result.error.message);
  return result.data;
};
