// @vitest-environment node
import { toActor } from './actor-mapper';

it('traduce el usuario del backend a Actor', () => {
  expect(toActor({ usr_id: 'u2', usr_role: 'manager' })).toEqual({ id: 'u2', role: 'manager' });
});

it('sin usuario o con un rol desconocido no hay actor (fail closed)', () => {
  expect(toActor(null)).toBeNull();
  expect(toActor({ usr_id: 'u9', usr_role: 'superuser' })).toBeNull();
});
