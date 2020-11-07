import {BuildActor} from "../scripts/actorBuilder.js"
import * as fs from 'fs';

let charToImport = fs.readFileSync('./testData.txt', 'utf8');
// navigator.clipboard.writeText(charToImport);
BuildActor(charToImport, "npc", false);