// Resultado de una consulta de solo lectura: nunca lanza, así el caller decide qué mostrar
export type QueryResult<T> = { ok: true; data: T } | { ok: false };
