/** Une clases condicionales: cx('a', cond && 'b') → 'a b' */
export function cx(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ');
}
