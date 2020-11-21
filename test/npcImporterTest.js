import { BuildActor } from "../scripts/actorBuilder.js"
import * as fs from 'fs';
import { StatBlockParser } from "../scripts/parseStatBlock.js";
import { SpecialAbilitiesParser, SpecialAbilitiesForDescription } from "../scripts/dataBuilders/buildActorItemsSpecialAbilities.js"
import{BuildActorItems} from "../scripts/dataBuilders/buildActorItems.js";
// import { ItemGearBuilder } from "../scripts/buildActorGear.js";
// import {GetAllPackageNames} from "../scripts/foundryActions.js";


let charToImport = fs.readFileSync('./testData.txt', 'utf8');
// let charToImport = fs.readFileSync('./dragon.txt', 'utf8');
// navigator.clipboard.writeText(charToImport);
// BuildActor("npc", false, 0, charToImport);
StatBlockParser(charToImport)




// let s = {
    // "Armor +4": "Scaly hide.",
    // "Bite/Claws": "Str+d8.",
    // "Fear (−2)": "Anyone who sees a mighty dragon must make a Fear check at −2.",
    // "Fiery Breath": "Dragons breathe fire for 3d6 damage (see Breath Weapons, page 175).",
    // "Flight": "Dragons have a Flying Pace of 24″.",
    // "Hardy": "The creature does not suffer a Wound from being Shaken twice.",
    // "Size 8 (Huge)": "Dragons are massive creatures, over 40′ long from nose to tail and weighing over 30,000 pounds.",
    // "Swat": "Dragons ignore up to 4 points of Scale penalties when attacking with their claws.",
    // "Tail Lash": "Str+d4. The creature may make a free attack against up to two foes to its side or rear at no penalty.",
//     "Bite": "Str.",
//     "Constrict": "+2 to Athletics and Strength rolls made to grapple.",
//     "Poison (−4)": "Usually Mild or Lethal. See page 128.",
//     "Size −1": "These spiders are dog-sized."
// }
// console.log(SpecialAbilitiesForDescription(s));


// let gear = {
//     "9mm pistol": {
//         "Range": "12/24/48",
//         "Damage": "2d6",
//         "RoF": "1",
//         "AP": "1"
//     },
//     "Desert Eagle": {
//         "Range": "12/24/48",
//         "Damage": "2d6+1",
//         "RoF": "1",
//         "AP": "1"
//     },
//     "Leather armor": "+1",
//     "scimitar": "Str+d8",
//     "Laser Sword": "Str+d8+5",
//     "2 extra clips": null,
//     "backpack": null
// }
// await ItemGearBuilder(gear);

// let s =
// {
//     "Name": "Minotaur",
//     "Biography": {
//         "value": "Minotaurs stand over seven feet tall and have massive, bull-like heads and horns. In many fantasy worlds, they are used as guardians of labyrinths. In others, they are simply another race of creatures occupying a fantastically savage land. In all cases, they are fierce beasts eager for battle and the taste of their opponents’ flesh."
//     },
//     "Attributes": {
//         "agility": {
//             "die": {
//                 "sides": 8,
//                 "modifier": 0
//             }
//         },
//         "smarts": {
//             "die": {
//                 "sides": 6,
//                 "modifier": 0
//             }
//         },
//         "spirit": {
//             "die": {
//                 "sides": 8,
//                 "modifier": 0
//             }
//         },
//         "strength": {
//             "die": {
//                 "sides": 12,
//                 "modifier": 3
//             }
//         },
//         "vigor": {
//             "die": {
//                 "sides": 12,
//                 "modifier": 0
//             }
//         }
//     },
//     "Skills": {
//         "athletics": {
//             "sides": 8,
//             "modifier": 0
//         },
//         "common knowledge": {
//             "sides": 6,
//             "modifier": 0
//         },
//         "fighting": {
//             "sides": 10,
//             "modifier": 0
//         },
//         "intimidation": {
//             "sides": 12,
//             "modifier": 0
//         },
//         "notice": {
//             "sides": 10,
//             "modifier": 0
//         },
//         "persuasion": {
//             "sides": 4,
//             "modifier": 0
//         },
//         "stealth": {
//             "sides": 8,
//             "modifier": 0
//         }
//     },
//     "Pace": 8,
//     "Parry": 7,
//     "Toughness": 12,
//     "Edges": [
//         "Fleet-Footed"
//     ],
//     "Special Abilities": {
//         "Horns": "Str+d4.",
//         "Resilient": "Minotaurs can take one Wound before they’re Incapacitated.",
//         "Size 3": "Minotaurs stand over 7′ tall and have the mass of bulls."
//     },
//     "Gear": {
//         "Leather armor": "+1",
//         "spear": {
//             "Reach": "1"
//         }
//     },
//     "Size": 3
// };
// BuildActorItems(s);