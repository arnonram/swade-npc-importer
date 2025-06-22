export function isEmpty(obj: any): boolean {
  return (
    obj == null || (typeof obj === 'object' && Object.keys(obj).length === 0)
  );
}
