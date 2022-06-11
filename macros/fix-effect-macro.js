const allActors = game.actors.filter(a => a.data.type == 'npc');
let toUpdate = false;

for (const actor of allActors) {
  toUpdate = false;
  const actorToUpdate = removeEffects(actor.toObject());
  console.log('updating:' + toUpdate);
  await actor.delete();
  await Actor.create(actorToUpdate);
}

function removeEffects(data) {
  for (var property in data) {
    if (typeof data[property] == 'object') {
      delete data.property;
      let newJsonData = removeEffects(data[property], 'effects');
      data[property] = newJsonData;
    } else {
      if (property === 'effects' && typeof data[property] === 'string') {
        delete data[property];
        toUpdate = true;
      }
    }
  }
  return data;
}
