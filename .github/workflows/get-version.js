import { readFileSync } from 'fs';

console.log(JSON.parse(readFileSync('./module.json', 'utf8')).version);
