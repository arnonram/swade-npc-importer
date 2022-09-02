import _ from 'lodash';

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

function deepOmit(obj: object, keysToOmit: string[]) {
  var keysToOmitIndex = _.keyBy(
    Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit]
  );

  function omitFromObject(obj: object) {
    return _.transform(obj, function (result, value, key) {
      if (key in keysToOmitIndex) {
        return;
      }

      result[key] = _.isObject(value) ? omitFromObject(value) : value;
    });
  }

  return omitFromObject(obj);
}
