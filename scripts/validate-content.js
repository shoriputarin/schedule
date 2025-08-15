#!/usr/bin/env node
/* Simple content validator without external deps */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const spotsDir = path.join(ROOT, 'content', 'spots');
const itinDir = path.join(ROOT, 'content', 'itinerary');

const errors = [];

function readJson(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    errors.push(`JSON parse error in ${file}: ${e.message}`);
    return null;
  }
}

function validateSlug(slug, ctx) {
  if (typeof slug !== 'string') return `${ctx}: slug must be string`;
  if (!/^[a-z0-9-]+$/.test(slug)) return `${ctx}: slug must match ^[a-z0-9-]+$`;
  return null;
}

// Load spots
const spotFiles = fs.existsSync(spotsDir)
  ? fs.readdirSync(spotsDir).filter(f => f.endsWith('.json'))
  : [];
const spots = [];
const spotSlugs = new Set();
for (const f of spotFiles) {
  const p = path.join(spotsDir, f);
  const j = readJson(p);
  if (!j) continue;
  const ctx = `spots/${f}`;
  const eSlug = validateSlug(j.slug, ctx);
  if (eSlug) errors.push(eSlug);
  if (spotSlugs.has(j.slug)) errors.push(`${ctx}: duplicate slug ${j.slug}`);
  spotSlugs.add(j.slug);
  if (typeof j.day !== 'number') errors.push(`${ctx}: day must be number`);
  if (typeof j.lat !== 'number' || typeof j.lng !== 'number') errors.push(`${ctx}: lat/lng must be numbers`);
  if (!j.name_ja || !j.name_en) errors.push(`${ctx}: name_ja/name_en required`);
  if (!j.summary_ja || !j.summary_en) errors.push(`${ctx}: summary_ja/summary_en required`);
  if (!Array.isArray(j.highlights_ja) || !Array.isArray(j.highlights_en)) errors.push(`${ctx}: highlights_ja/en must be arrays`);
  if (!Array.isArray(j.media)) errors.push(`${ctx}: media must be array`);
  else {
    j.media.forEach((m, idx) => {
      if (!m || typeof m !== 'object') errors.push(`${ctx}: media[${idx}] must be object`);
      if (!m.type) errors.push(`${ctx}: media[${idx}].type required`);
      if (!m.src) errors.push(`${ctx}: media[${idx}].src required`);
      if (!m.alt) errors.push(`${ctx}: media[${idx}].alt required`);
    });
  }
  spots.push(j);
}

// Load itineraries
const itinFiles = fs.existsSync(itinDir)
  ? fs.readdirSync(itinDir).filter(f => f.endsWith('.json'))
  : [];
for (const f of itinFiles) {
  const p = path.join(itinDir, f);
  const j = readJson(p);
  if (!j) continue;
  const ctx = `itinerary/${f}`;
  if (typeof j.day !== 'number') errors.push(`${ctx}: day must be number`);
  if (!Array.isArray(j.order)) errors.push(`${ctx}: order must be array`);
  else {
    j.order.forEach((slug, idx) => {
      const eSlug = validateSlug(slug, `${ctx}.order[${idx}]`);
      if (eSlug) errors.push(eSlug);
      if (!spotSlugs.has(slug)) errors.push(`${ctx}: order[${idx}] slug '${slug}' not found in spots`);
    });
  }
  if (j.route != null) {
    if (!j.route || j.route.type !== 'LineString' || !Array.isArray(j.route.coordinates)) {
      errors.push(`${ctx}: route must be GeoJSON LineString with coordinates`);
    } else {
      j.route.coordinates.forEach((c, i) => {
        if (!Array.isArray(c) || c.length !== 2 || typeof c[0] !== 'number' || typeof c[1] !== 'number') {
          errors.push(`${ctx}: route.coordinates[${i}] must be [lng, lat] numbers`);
        }
      });
    }
  }
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  errors.forEach(e => console.error(' -', e));
  process.exit(1);
} else {
  console.log('Validation passed for content:');
  console.log(` - spots: ${spots.length}`);
  console.log(` - itineraries: ${itinFiles.length}`);
}

