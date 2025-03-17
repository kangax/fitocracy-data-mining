/**
 * Combine Workout Data
 * 
 * This script combines workout data from Fitocracy (data4.json) with
 * Strong App data (workout_data directory).
 */

const fs = require('fs');
const path = require('path');
const { mapExercises } = require('./exerciseMapper');
const { combineData } = require('./dataConverter');

/**
 * Main function to run the entire process
 */
async function main() {
  console.log('=== Fitocracy + Strong App Data Combination ===');
  console.log('This script will:');
  console.log('1. Map exercises between Fitocracy and Strong App');
  console.log('2. Convert Fitocracy data to Strong App format');
  console.log('3. Combine the datasets');
  console.log('4. Generate output files in the combined_data directory');
  console.log('');
  
  // Create output directory if it doesn't exist
  const outputDir = 'combined_data';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Step 1: Map exercises
  console.log('Step 1: Mapping exercises...');
  const mapping = mapExercises();
  console.log(`Exercise mapping complete: ${mapping.summary.exactMatches + mapping.summary.confidentMatches} matches found`);
  console.log('');
  
  // Step 2: Convert and combine data
  console.log('Step 2: Converting and combining data...');
  await combineData();
  console.log('');
  
  // Step 3: Generate summary
  console.log('Step 3: Generating summary...');
  generateSummary(outputDir);
  
  console.log('');
  console.log('=== Process Complete ===');
  console.log(`Output files are available in the ${outputDir} directory`);
}

/**
 * Generate a summary of the combined data
 */
function generateSummary(outputDir) {
  // Read the summary file
  const summaryPath = path.join(outputDir, 'summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.log('Summary file not found. Skipping summary generation.');
    return;
  }
  
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  
  // Calculate total sessions and entries
  let totalSessions = 0;
  let totalEntries = 0;
  
  for (const [year, stats] of Object.entries(summary.yearlyStats)) {
    totalSessions += stats.sessions;
    totalEntries += stats.entries;
  }
  
  // Read the exercise mapping
  const mappingPath = 'exercise_mapping.json';
  if (!fs.existsSync(mappingPath)) {
    console.log('Exercise mapping file not found. Skipping mapping summary.');
    return;
  }
  
  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  
  // Print summary
  console.log('Combined Data Summary:');
  console.log(`- Total exercises: ${summary.totalExercises}`);
  console.log(`- Total workout sessions: ${totalSessions}`);
  console.log(`- Total exercise entries: ${totalEntries}`);
  console.log('');
  
  console.log('Exercise Mapping Summary:');
  console.log(`- Exact matches: ${mapping.summary.exactMatches}`);
  console.log(`- Confident matches: ${mapping.summary.confidentMatches}`);
  console.log(`- Ambiguous matches: ${mapping.summary.ambiguousMatches}`);
  console.log(`- Unmatched exercises: ${mapping.summary.noMatches}`);
  console.log('');
  
  console.log('Yearly Statistics:');
  for (const [year, stats] of Object.entries(summary.yearlyStats)) {
    console.log(`- ${year}: ${stats.sessions} sessions, ${stats.entries} entries (${stats.jsonSizeMB} MB)`);
  }
}

// Run the main function
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
