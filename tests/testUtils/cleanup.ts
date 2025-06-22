export function cleanActor(data: object) {
  return deepOmit(data, [
    '_id',
    'actorId',
    'sort',
    'flags.exportSource',
    'coreVersion',
    'systemVersion',
  ]);
}

function deepOmit(obj: any, keysToOmit: string[]): any {
  const keysToOmitSet = new Set(
    Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit],
  );

  function omitFromObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(omitFromObject);
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (keysToOmitSet.has(key)) continue;
        result[key] = omitFromObject(value);
      }
      return result;
    }
    return obj;
  }

  return omitFromObject(obj);
}
