// INFRAESTRUCTURA · Traduce el usuario del backend heredado ({ usr_id, usr_role }) al Actor del dominio.
// Un rol desconocido no concede permisos: se trata como «sin sesión» (fail closed).
import type { Actor, Role } from '../domain/cancellation';

const ROLES: Role[] = ['admin', 'manager', 'agent'];

export type UserDto = { usr_id: string; usr_role: string };

export function toActor(user: UserDto | null | undefined): Actor | null {
  if (!user || !(ROLES as string[]).includes(user.usr_role)) return null;
  return { id: user.usr_id, role: user.usr_role as Role };
}
