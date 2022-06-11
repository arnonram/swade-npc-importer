// SWADE NPC Importer Macro
// This macro is here in order to retro-fix imported characters due to a bug in version 0.1.14
// In that version, Items with effect would have been imported incorectly, and this macro runs on the NPCs and fixes it
// If you want this macro to run on all characters, then change then change the first line of code to => `const allActors = game.actors`

// !!!! IMPORTANT: !!!!!
// This will go over ALL Actors in a world. I strongly recommened that you backup the World or your Actors somwhow before running the fix macro.
// For any Actor which has an `effects` fields to fix, then it will delete the Actor and create a new one (this might remove certain links on the affected Actor due to ID change)

const allActors = game.actors.filter(a => a.data.type == 'npc');
let toUpdate = false;

for (const actor of allActors) {
  toUpdate = false;
  const actorToUpdate = removeEffects(actor.toObject());
  if (toUpdate) {
    console.log('updating:' + toUpdate);
    await actor.delete();
    await Actor.create(actorToUpdate);
  }
}

function removeEffects(data) {
  for (var property in data) {
    if (typeof data[property] == 'object') {
      delete data.property;
      let newJsonData = removeEffects(data[property], 'effects');
      data[property] = newJsonData;
    } else {
      if (property === 'effects' && typeof data[property] === 'string') {
        data[property] = JSON.parse(data[property]);
        toUpdate = true;
      }
    }
  }
  return data;
}

// const allActors = game.actors.filter(a => a.data.type == 'npc');

// for (const actor of allActors) {
//   for (let actor of game.actors) {
//     for (let item of actor.items) {
//       if (typeof item.toObject()['effects'] === 'string') {
//         const update = {
//           _id: item.toJSON()._id,
//           effects: JSON.parse(item.toJSON()['effects']),
//         };
//         console.log(update);

//         await item.updateEmbeddedDocuments('ActiveEffect', [update]);
//       }
//     }
//   }
//   console.log(actor.toObject());
// }

// let updates = actor.items
// .toObject()
// .filter(item => typeof item.effects === 'string')
// .map(itemUpdate => ({
//   _id: itemUpdate._id,
//   effects: JSON.parse(itemUpdate.effects),
// }));
// updates.forEach(element => {
// console.log(element);
// });
// if (updates.length > 0) {
// console.log(`Updating character: ${actor.name} / ${actor.id}`);
// await actor.updateEmbeddedDocuments('Item', updates);
// console.log(actor.toObject());
// }
