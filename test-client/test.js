import { CratesClient } from '../dist/index.js';

const crates = new CratesClient();

const results = await crates.search({ query: 'serde', perPage: 1 });
console.log(`Found ${results.meta.total} crates matching serde`);

const latest = await crates.crate('serde').latest();
console.log(`serde latest: ${latest.num}`);
