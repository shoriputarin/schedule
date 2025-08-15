#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const ROOT = path.resolve(__dirname, '..');
const spotsDir = path.join(ROOT, 'content', 'spots');
const itinDir = path.join(ROOT, 'content', 'itinerary');

const slugRegex = /^[a-z0-9-]+$/;
const MediaSchema = z.object({
  type: z.enum(['image', 'youtube', 'url']),
  src: z.string().min(1),
  alt: z.string().min(1),
  title: z.string().optional(),
});

const SpotSchema = z.object({
  slug: z.string().regex(slugRegex, 'slug must match ^[a-z0-9-]+$'),
  name_ja: z.string().min(1),
  name_en: z.string().min(1),
  day: z.number().int(),
  lat: z.number(),
  lng: z.number(),
  summary_ja: z.string().min(1),
  summary_en: z.string().min(1),
  highlights_ja: z.array(z.string()),
  highlights_en: z.array(z.string()),
  media: z.array(MediaSchema),
});

const LineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number(), z.number()])), // [lng, lat]
});

const ItinerarySchema = z.object({
  day: z.number().int(),
  title_ja: z.string().min(1),
  title_en: z.string().min(1),
  order: z.array(z.string().regex(slugRegex)),
  route: LineStringSchema.optional(),
});

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`JSON parse error in ${file}: ${e.message}`);
  }
}

const errors = [];

// Validate spots
const spotFiles = fs.existsSync(spotsDir)
  ? fs.readdirSync(spotsDir).filter((f) => f.endsWith('.json'))
  : [];
const spotSlugs = new Set();
for (const f of spotFiles) {
  const p = path.join(spotsDir, f);
  try {
    const data = readJson(p);
    const parsed = SpotSchema.safeParse(data);
    if (!parsed.success) {
      parsed.error.issues.forEach((iss) => {
        errors.push(`spots/${f}: ${iss.path.join('.')} - ${iss.message}`);
      });
      continue;
    }
    const slug = parsed.data.slug;
    if (spotSlugs.has(slug)) errors.push(`spots/${f}: duplicate slug '${slug}'`);
    spotSlugs.add(slug);
  } catch (e) {
    errors.push(e.message);
  }
}

// Validate itineraries
const itinFiles = fs.existsSync(itinDir)
  ? fs.readdirSync(itinDir).filter((f) => f.endsWith('.json'))
  : [];
for (const f of itinFiles) {
  const p = path.join(itinDir, f);
  try {
    const data = readJson(p);
    const parsed = ItinerarySchema.safeParse(data);
    if (!parsed.success) {
      parsed.error.issues.forEach((iss) => {
        errors.push(`itinerary/${f}: ${iss.path.join('.')} - ${iss.message}`);
      });
      continue;
    }
    parsed.data.order.forEach((slug, idx) => {
      if (!spotSlugs.has(slug)) {
        errors.push(`itinerary/${f}: order[${idx}] slug '${slug}' not found in spots`);
      }
    });
  } catch (e) {
    errors.push(e.message);
  }
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  errors.forEach((e) => console.error(' -', e));
  process.exit(1);
} else {
  console.log('Zod validation passed');
  console.log(` - spots: ${spotFiles.length}`);
  console.log(` - itineraries: ${itinFiles.length}`);
}

