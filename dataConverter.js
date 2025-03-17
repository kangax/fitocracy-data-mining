/**
 * Data Converter
 * 
 * This script converts Fitocracy data to Strong App format and combines them.
 * It processes the large data4.json file in chunks to avoid memory issues.
 */

const fs = require('fs');
const path = require('path');
const { mapExercises, getStrongExerciseId } = require('./exerciseMapper');

// Configuration
const FITOCRACY_DATA_FILE = 'data4.json';
const OUTPUT_DIR = 'combined_data';
const CHUNK_SIZE = 10000; // Number of lines to process at once

/**
 * Create a mapping between Fitocracy exercise names and Strong exercise IDs
 */
function createExerciseMapping() {
  // Check if mapping already exists
  if (fs.existsSync('exercise_mapping.json')) {
    console.log('Using existing exercise mapping...');
    return JSON.parse(fs.readFileSync('exercise_mapping.json', 'utf8'));
  }
  
  // Generate new mapping
  console.log('Generating exercise mapping...');
  return mapExercises();
}

/**
 * Get Strong exercise ID for a Fitocracy exercise name
 */
function getExerciseId(exerciseName, mapping) {
  // Check exact matches
  const exactMatch = mapping.matches.find(m => m.fitocracy === exerciseName);
  if (exactMatch) {
    return exactMatch.strongId;
  }
  
  // Check ambiguous matches (with high confidence)
  const ambiguousMatch = mapping.ambiguousMatches.find(
    m => m.fitocracy === exerciseName && m.score >= 60
  );
  if (ambiguousMatch) {
    return ambiguousMatch.strongId;
  }
  
  // No match found, need to create a new exercise
  return null;
}

/**
 * Create a new exercise in the Strong format
 */
function createNewExercise(exerciseName, strongExercises) {
  // Find the highest existing ID and increment
  const maxId = Math.max(...strongExercises.exercises.map(ex => ex.id));
  const newId = maxId + 1;
  
  // Determine exercise type
  let primaryType = 'resistance';
  const lowerName = exerciseName.toLowerCase();
  
  if (lowerName.includes('run') || lowerName.includes('walk') || 
      lowerName.includes('row') || lowerName.includes('bike') ||
      lowerName.includes('swim')) {
    primaryType = 'distance';
  } else if (lowerName.includes('plank') || lowerName.includes('hold') || 
             lowerName.includes('hang')) {
    primaryType = 'duration';
  } else if (lowerName.includes('burpee') || lowerName.includes('thruster') || 
             lowerName.includes('clean and jerk') || lowerName.includes('snatch')) {
    primaryType = 'complex';
  }
  
  // Create new exercise object
  const newExercise = {
    id: newId,
    name: exerciseName,
    primaryType
  };
  
  // Extract base exercise and modifier if possible
  if (exerciseName.includes('(')) {
    newExercise.baseExercise = exerciseName.split('(')[0].trim();
    const modifierMatch = exerciseName.match(/\((.*?)\)/);
    if (modifierMatch && modifierMatch[1]) {
      newExercise.modifier = modifierMatch[1];
    }
  }
  
  // Determine equipment
  const equipmentTerms = {
    'barbell': 'Barbell',
    'dumbbell': 'Dumbbell', 
    'kettlebell': 'Kettlebell',
    'machine': 'Machine',
    'cable': 'Cable',
    'smith machine': 'Smith Machine'
  };
  
  for (const [term, equipment] of Object.entries(equipmentTerms)) {
    if (exerciseName.toLowerCase().includes(term)) {
      newExercise.equipment = equipment;
      break;
    }
  }
  
  // Add to exercises array
  strongExercises.exercises.push(newExercise);
  
  // Update metadata
  strongExercises.metadata.count = strongExercises.exercises.length;
  
  return newId;
}

/**
 * Convert Fitocracy effort values to Strong format
 */
function convertEffortValues(action, exerciseType) {
  const set = {};
  
  // Handle different exercise types
  switch (exerciseType) {
    case 'resistance':
      // Convert reps
      if (action.effort1_unit?.abbr === 'reps' || action.effort1_unit === 'reps') {
        set.reps = action.effort1;
      }
      
      // Convert weight
      if (action.effort0_unit?.abbr === 'lb' || action.effort0_unit === 'lb') {
        set.weight = {
          value: action.effort0,
          unit: 'pound'
        };
      } else if (action.effort0_unit?.abbr === 'kg' || action.effort0_unit === 'kg') {
        // Convert kg to pounds for consistency
        set.weight = {
          value: action.effort0_imperial || action.effort0 * 2.20462,
          unit: 'pound'
        };
      }
      break;
      
    case 'distance':
      // Convert distance
      if (action.effort0_unit?.abbr === 'mi' || action.effort0_unit === 'mi') {
        set.distance = {
          value: action.effort0,
          unit: 'mile'
        };
      } else if (action.effort0_unit?.abbr === 'km' || action.effort0_unit === 'km') {
        // Convert km to miles for consistency
        set.distance = {
          value: action.effort0 * 0.621371,
          unit: 'mile'
        };
      }
      
      // Convert time
      if (action.effort1_unit?.abbr === 'sec' || action.effort1_unit === 'sec') {
        set.seconds = action.effort1;
      }
      break;
      
    case 'duration':
      // Convert time
      if (action.effort0_unit?.abbr === 'sec' || action.effort0_unit === 'sec') {
        set.seconds = action.effort0;
      }
      
      // Convert reps if available
      if (action.effort1_unit?.abbr === 'reps' || action.effort1_unit === 'reps') {
        set.reps = action.effort1;
      }
      break;
      
    case 'complex':
      // Handle complex exercises (may have reps, weight, distance, time)
      if (action.effort0_unit?.abbr === 'reps' || action.effort0_unit === 'reps') {
        set.reps = action.effort0;
      }
      
      if (action.effort1_unit?.abbr === 'lb' || action.effort1_unit === 'lb') {
        set.primaryLoad = {
          value: action.effort1,
          unit: 'pound'
        };
      } else if (action.effort1_unit?.abbr === 'kg' || action.effort1_unit === 'kg') {
        set.primaryLoad = {
          value: action.effort1_imperial || action.effort1 * 2.20462,
          unit: 'pound'
        };
      }
      
      // Handle additional efforts if present
      if (action.effort2_unit?.abbr === 'sec' || action.effort2_unit === 'sec') {
        set.seconds = action.effort2;
      }
      break;
  }
  
  return set;
}

/**
 * Extract date and time from Fitocracy action
 */
function extractDateTime(action) {
  if (!action.actiondate) {
    return { date: null, time: null };
  }
  
  try {
    const date = new Date(action.actiondate);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0];
    
    return {
      date: dateStr,
      time: timeStr
    };
  } catch (err) {
    console.error('Error parsing date:', action.actiondate);
    return { date: null, time: null };
  }
}

/**
 * Process Fitocracy data in chunks
 */
async function processFitocracyData() {
  console.log(`Processing Fitocracy data from ${FITOCRACY_DATA_FILE}...`);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Get exercise mapping
  const mapping = createExerciseMapping();
  
  // Load Strong exercises data (to add new exercises)
  const strongExercises = JSON.parse(fs.readFileSync('workout_data/exercises.json', 'utf8'));
  
  // Track sessions by year
  const sessionsByYear = {};
  
  // Create a stream to read the file
  const fileStream = fs.createReadStream(FITOCRACY_DATA_FILE, { encoding: 'utf8' });
  
  let buffer = '';
  let inObject = false;
  let currentExercise = null;
  let processedExercises = 0;
  
  // Process the file in chunks
  for await (const chunk of fileStream) {
    buffer += chunk;
    
    // Process complete objects
    while (buffer.length > 0) {
      if (!inObject) {
        // Look for the start of an exercise object
        const exerciseStart = buffer.match(/"([^"]+)":\s*\[/);
        if (!exerciseStart) {
          break; // Wait for more data
        }
        
        currentExercise = exerciseStart[1];
        inObject = true;
        buffer = buffer.slice(exerciseStart.index + exerciseStart[0].length);
      } else {
        // Find the end of the current exercise array
        let bracketCount = 1; // We've already seen one opening bracket
        let endIndex = -1;
        
        for (let i = 0; i < buffer.length; i++) {
          if (buffer[i] === '[') bracketCount++;
          else if (buffer[i] === ']') bracketCount--;
          
          if (bracketCount === 0) {
            endIndex = i;
            break;
          }
        }
        
        if (endIndex === -1) {
          break; // Wait for more data
        }
        
        // Extract and process the exercise data
        try {
          const exerciseData = JSON.parse('[' + buffer.slice(0, endIndex) + ']');
          processExercise(currentExercise, exerciseData, mapping, strongExercises, sessionsByYear);
          processedExercises++;
          
          if (processedExercises % 10 === 0) {
            console.log(`Processed ${processedExercises} exercises...`);
          }
        } catch (err) {
          console.error(`Error processing exercise ${currentExercise}:`, err);
        }
        
        // Move to the next exercise
        buffer = buffer.slice(endIndex + 1);
        inObject = false;
        currentExercise = null;
      }
    }
  }
  
  console.log(`Processed ${processedExercises} exercises.`);
  
  // Write updated exercises file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'exercises.json'),
    JSON.stringify(strongExercises, null, 2)
  );
  
  // Write sessions by year
  for (const [year, sessions] of Object.entries(sessionsByYear)) {
    const yearData = {
      metadata: {
        exportDate: new Date().toISOString(),
        year,
        count: sessions.length
      },
      sessions
    };
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `sessions_${year}.json`),
      JSON.stringify(yearData, null, 2)
    );
    
    console.log(`Wrote ${sessions.length} sessions for year ${year}`);
  }
  
  // Create summary file
  const summary = {
    exportDate: new Date().toISOString(),
    totalExercises: strongExercises.exercises.length,
    yearlyStats: {}
  };
  
  for (const [year, sessions] of Object.entries(sessionsByYear)) {
    const filePath = path.join(OUTPUT_DIR, `sessions_${year}.json`);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    summary.yearlyStats[year] = {
      entries: sessions.reduce((count, session) => count + session.exercises.length, 0),
      sessions: sessions.length,
      jsonSizeMB: sizeMB
    };
  }
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('Conversion complete!');
}

/**
 * Process a single exercise from Fitocracy data
 */
function processExercise(exerciseName, exerciseData, mapping, strongExercises, sessionsByYear) {
  // Get or create exercise ID
  let exerciseId = getExerciseId(exerciseName, mapping);
  
  if (!exerciseId) {
    exerciseId = createNewExercise(exerciseName, strongExercises);
  }
  
  // Get exercise type
  const exercise = strongExercises.exercises.find(ex => ex.id === exerciseId);
  const exerciseType = exercise ? exercise.primaryType : 'resistance';
  
  // Process each session
  for (const session of exerciseData) {
    if (!session.actions || !Array.isArray(session.actions) || session.actions.length === 0) {
      continue;
    }
    
    // Extract date and time from the first action
    const { date, time } = extractDateTime(session.actions[0]);
    if (!date) continue;
    
    const year = date.split('-')[0];
    
    // Initialize year if needed
    if (!sessionsByYear[year]) {
      sessionsByYear[year] = [];
    }
    
    // Check if session already exists for this date/time
    let existingSession = sessionsByYear[year].find(s => 
      s.date === date && s.time === time
    );
    
    if (!existingSession) {
      existingSession = {
        date,
        time,
        name: session.name || 'Fitocracy Workout',
        duration: session.duration || 0,
        exercises: []
      };
      sessionsByYear[year].push(existingSession);
    }
    
    // Convert actions to sets
    const sets = session.actions.map(action => convertEffortValues(action, exerciseType))
      .filter(set => Object.keys(set).length > 0); // Filter out empty sets
    
    if (sets.length === 0) continue;
    
    // Add exercise to session
    existingSession.exercises.push({
      exerciseId,
      sets
    });
  }
}

/**
 * Combine Fitocracy data with existing Strong data
 */
async function combineData() {
  console.log('Starting data conversion and combination...');
  
  // Process Fitocracy data
  await processFitocracyData();
  
  // Combine with existing Strong data
  console.log('Combining with existing Strong data...');
  
  // Get list of years from both datasets
  const strongYears = fs.readdirSync('workout_data')
    .filter(file => file.startsWith('sessions_') && file.endsWith('.json'))
    .map(file => file.replace('sessions_', '').replace('.json', ''));
  
  const fitocracyYears = fs.readdirSync(OUTPUT_DIR)
    .filter(file => file.startsWith('sessions_') && file.endsWith('.json'))
    .map(file => file.replace('sessions_', '').replace('.json', ''));
  
  const allYears = [...new Set([...strongYears, ...fitocracyYears])];
  
  // Combine data for each year
  for (const year of allYears) {
    const strongFilePath = path.join('workout_data', `sessions_${year}.json`);
    const fitocracyFilePath = path.join(OUTPUT_DIR, `sessions_${year}.json`);
    const outputFilePath = path.join(OUTPUT_DIR, `sessions_${year}.json`);
    
    let combinedSessions = [];
    
    // Add Strong data if available
    if (fs.existsSync(strongFilePath)) {
      const strongData = JSON.parse(fs.readFileSync(strongFilePath, 'utf8'));
      combinedSessions = [...strongData.sessions];
    }
    
    // Add Fitocracy data if available
    if (fs.existsSync(fitocracyFilePath)) {
      const fitocracyData = JSON.parse(fs.readFileSync(fitocracyFilePath, 'utf8'));
      
      // Merge sessions, avoiding duplicates
      for (const session of fitocracyData.sessions) {
        // Check if session already exists (same date and time)
        const existingIndex = combinedSessions.findIndex(s => 
          s.date === session.date && s.time === session.time
        );
        
        if (existingIndex >= 0) {
          // Merge exercises into existing session
          const existing = combinedSessions[existingIndex];
          existing.exercises = [...existing.exercises, ...session.exercises];
        } else {
          // Add as new session
          combinedSessions.push(session);
        }
      }
    }
    
    // Sort sessions by date and time
    combinedSessions.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    });
    
    // Write combined data
    const combinedData = {
      metadata: {
        exportDate: new Date().toISOString(),
        year,
        count: combinedSessions.length
      },
      sessions: combinedSessions
    };
    
    fs.writeFileSync(outputFilePath, JSON.stringify(combinedData, null, 2));
    console.log(`Combined ${combinedSessions.length} sessions for year ${year}`);
  }
  
  // Update summary file
  const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    
    // Update yearly stats
    for (const year of allYears) {
      const filePath = path.join(OUTPUT_DIR, `sessions_${year}.json`);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        summary.yearlyStats[year] = {
          entries: data.sessions.reduce((count, session) => count + session.exercises.length, 0),
          sessions: data.sessions.length,
          jsonSizeMB: sizeMB
        };
      }
    }
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  }
  
  console.log('Data combination complete!');
}

// If this script is run directly, execute the data combination
if (require.main === module) {
  combineData().catch(err => {
    console.error('Error combining data:', err);
    process.exit(1);
  });
}

module.exports = {
  combineData
};
