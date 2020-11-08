import {BuildActor} from "../scripts/actorBuilder.js"
import * as fs from 'fs';
import { StatBlockParser } from "../scripts/parseStatBlock.js";
import {SpecialAbilitiesParser} from "../scripts/parseSpecialAbilities.js"

// let charToImport = fs.readFileSync('./testData.txt', 'utf8');
let charToImport = fs.readFileSync('./testData.txt', 'utf8');
// navigator.clipboard.writeText(charToImport);
BuildActor("npc", false, 0, charToImport);
// StatBlockParser(charToImport)



// let s = {
//     "Armor +4": "Scaly hide.",
//     "Bite/Claws": "Str+d8.",
//     "Fear (−2)": "Anyone who sees a mighty dragon must make a Fear check at −2.",
//     "Fiery Breath": "Dragons breathe fire for 3d6 damage (see Breath Weapons, page 175).",
//     "Flight": "Dragons have a Flying Pace of 24″.",
//     "Hardy": "The creature does not suffer a Wound from being Shaken twice.",
//     "Size 8 (Huge)": "Dragons are massive creatures, over 40′ long from nose to tail and weighing over 30,000 pounds.",
//     "Swat": "Dragons ignore up to 4 points of Scale penalties when attacking with their claws.",
//     "Tail Lash": "Str+d4. The creature may make a free attack against up to two foes to its side or rear at no penalty.",
//     "Puff" : "Str."
// }
// SpecialAbilitiesParser(s);