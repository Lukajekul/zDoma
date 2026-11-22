// T-69: keep the ticked ids in step with the own items: a new item starts
// ticked, a removed one is unticked. Pure.
export function sinhronizirajIzbor(izbrani: string[], prej: { id: string }[], potem: { id: string }[]): string[] {
  const odstranjeni = new Set(prej.filter((x) => !potem.some((y) => y.id === x.id)).map((x) => x.id));
  const novi = potem.filter((y) => !prej.some((x) => x.id === y.id)).map((y) => y.id);
  return [...izbrani.filter((id) => !odstranjeni.has(id)), ...novi.filter((id) => !izbrani.includes(id))];
}
