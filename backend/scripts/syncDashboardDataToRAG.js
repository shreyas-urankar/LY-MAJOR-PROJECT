import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Data from '../models/dataModel.js';
import { generateEmbeddingForText } from '../controllers/ragController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.getClient().db();
  console.log('Fetching dashboard data...');
  
  const pops = await db.collection('populations').find().toArray();
  const infs = await db.collection('infrastructures').find().toArray();
  const envs = await db.collection('environments').find().toArray();
  const trans = await db.collection('transports').find().limit(20).toArray();
  
  const docsToInsert = [];
  
  if (pops.length) {
    const text = 'Population Dashboard Data: ' + pops.map(p => `In ${p.year}, ${p.city} had a population of ${p.totalPopulation} with a density of ${p.density} per km2 and growth rate of ${p.growthRate}%.`).join(' ');
    docsToInsert.push({ username: 'system', action: 'PREDICT', city: 'Pune', analysisResult: text });
  }
  
  if (infs.length) {
    const text = 'Infrastructure Dashboard Data: ' + infs.map(i => `In ${i.year}, ${i.city} infrastructure index was ${i.infrastructure_index}. Hospitals: ${i.hospitals}, Schools: ${i.schools}, Road Length: ${i.road_length_km}km. Budget: ${i.budget_allocated_millions} million.`).join(' ');
    docsToInsert.push({ username: 'system', action: 'PREDICT', city: 'Pune', analysisResult: text });
  }
  
  if (envs.length) {
    const text = 'Environment Dashboard Data: ' + envs.map(e => `In ${e.year}, ${e.city} AQI was ${e.aqi}. Green coverage: ${e.green_coverage_percent}%. Temperature: ${e.avg_temperature_c}C. CO2 emissions: ${e.co2_emissions_mt} MT. Air quality status: ${e.air_quality_status}.`).join(' ');
    docsToInsert.push({ username: 'system', action: 'PREDICT', city: 'Pune', analysisResult: text });
  }
  
  if (trans.length) {
    const text = 'Transport Dashboard Data (Sample): ' + trans.map(t => {
      const coords = t.location?.coordinates ? t.location.coordinates.join(',') : 'unknown';
      return `At ${t.date || t.timestamp}, location [${coords}] had traffic volume/index ${t.trafficIndex} with avg speed ${t.avgSpeed}km/h. Congestion level: ${t.congestionLevel}. Public transit usage: ${t.publicTransportUsage}.`;
    }).join(' ');
    docsToInsert.push({ username: 'system', action: 'PREDICT', city: 'Pune', analysisResult: text });
  }
  
  console.log(`Generating embeddings for ${docsToInsert.length} documents...`);
  
  for (const doc of docsToInsert) {
    const vector = await generateEmbeddingForText(doc.analysisResult);
    if (vector && vector.length) {
      const newDoc = new Data({
        userId: new mongoose.Types.ObjectId(),
        username: doc.username,
        action: doc.action,
        city: doc.city,
        analysisResult: doc.analysisResult,
        embedding: vector
      });
      await newDoc.save();
      console.log('Saved dashboard summary for:', doc.analysisResult.substring(0, 50) + '...');
    }
  }
  
  console.log('Successfully synchronized all dashboard data to RAG system!');
  process.exit(0);
}

run().catch(console.error);
