/**
 * Exercise Mapper
 * 
 * This script analyzes and maps exercises between Fitocracy and Strong App datasets.
 * It implements a rule-based normalization approach with equipment awareness
 * and confidence scoring to handle ambiguous cases.
 */

const fs = require('fs');
const path = require('path');

// Load exercise data
const fitocracyExercises = fs.readFileSync('fitocracy_exercises.txt', 'utf8').split('\n').filter(Boolean);
const strongExercises = fs.readFileSync('strong_exercises.txt', 'utf8').split('\n').filter(Boolean);
const strongExercisesData = JSON.parse(fs.readFileSync('workout_data/exercises.json', 'utf8'));

// Equipment terms for detection
const EQUIPMENT_TERMS = {
  'barbell': ['barbell'],
  'dumbbell': ['dumbbell', 'db'],
  'kettlebell': ['kettlebell', 'kb'],
  'machine': ['machine', 'machines'],
  'cable': ['cable'],
  'smith machine': ['smith machine'],
  'bodyweight': ['body weight', 'bodyweight', 'bw'],
  'suspension': ['trx', 'suspension trainer'],
  'band': ['band', 'bands', 'resistance band'],
  'plate': ['plate', 'plates']
};

// Default equipment for common exercises (when not specified)
const DEFAULT_EQUIPMENT = {
  'bench press': 'barbell',
  'squat': 'barbell',
  'deadlift': 'barbell',
  'overhead press': 'barbell',
  'shoulder press': 'barbell',
  'row': 'barbell',
  'lunge': 'bodyweight',
  'push up': 'bodyweight',
  'pull up': 'bodyweight',
  'chin up': 'bodyweight',
  'dip': 'bodyweight',
  'bulgarian split squat': 'bodyweight',
  'plank': 'bodyweight',
  'crunch': 'bodyweight',
  'sit up': 'bodyweight'
};

/**
 * Normalize an exercise name and extract equipment information
 */
function normalizeExercise(name) {
  const lowerName = name.toLowerCase();
  
  // Extract equipment information
  let equipment = null;
  for (const [equipType, terms] of Object.entries(EQUIPMENT_TERMS)) {
    if (terms.some(term => lowerName.includes(term))) {
      equipment = equipType;
      break;
    }
  }
  
  // Check for default equipment if none detected
  if (!equipment) {
    for (const [baseExercise, defaultEquip] of Object.entries(DEFAULT_EQUIPMENT)) {
      if (lowerName.includes(baseExercise)) {
        equipment = defaultEquip;
        break;
      }
    }
  }
  
  // Normalize the name
  let normalized = lowerName
    .replace(/\([^)]*\)/g, '')  // Remove parentheses and their contents
    .replace(/-/g, ' ')         // Replace hyphens with spaces
    .replace(/\s+/g, ' ')       // Normalize spaces
    .trim();
  
  // Remove equipment terms from the normalized name for better matching
  if (equipment) {
    const terms = EQUIPMENT_TERMS[equipment] || [];
    for (const term of terms) {
      normalized = normalized.replace(new RegExp('\\b' + term + '\\b', 'g'), '').trim();
    }
  }
  
  // Remove common filler words
  normalized = normalized
    .replace(/\b(with|using|on|the|a|an)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return { 
    original: name,
    normalized, 
    equipment 
  };
}

/**
 * Calculate confidence score for a potential match
 */
function calculateConfidence(fitEx, strongEx) {
  let score = 0;
  
  // Exact normalized name match
  if (fitEx.normalized === strongEx.normalized) {
    score += 50;
  } else if (fitEx.normalized.includes(strongEx.normalized) || 
             strongEx.normalized.includes(fitEx.normalized)) {
    // Partial name match
    score += 20;
    
    // Bonus for longer substring match
    const matchLength = Math.min(fitEx.normalized.length, strongEx.normalized.length);
    const maxLength = Math.max(fitEx.normalized.length, strongEx.normalized.length);
    score += 10 * (matchLength / maxLength);
  }
  
  // Equipment match
  if (fitEx.equipment && strongEx.equipment && fitEx.equipment === strongEx.equipment) {
    score += 30;
  } else if (fitEx.equipment && strongEx.equipment && fitEx.equipment !== strongEx.equipment) {
    // Equipment mismatch penalty
    score -= 20;
  }
  
  // Word overlap
  const fitWords = fitEx.normalized.split(' ').filter(w => w.length > 2);
  const strongWords = strongEx.normalized.split(' ').filter(w => w.length > 2);
  const commonWords = fitWords.filter(word => strongWords.includes(word));
  score += commonWords.length * 5;
  
  return Math.round(score);
}

/**
 * Find the best match for a Fitocracy exercise in the Strong dataset
 */
function findBestMatch(fitEx, normalizedStrong) {
  let bestMatch = null;
  let bestScore = 0;
  let ambiguous = false;
  
  for (const strongEx of normalizedStrong) {
    const score = calculateConfidence(fitEx, strongEx);
    
    if (score > bestScore) {
      bestMatch = strongEx;
      bestScore = score;
      ambiguous = false;
    } else if (score === bestScore && bestScore > 0) {
      ambiguous = true;
    }
  }
  
  return { 
    match: bestMatch, 
    score: bestScore,
    ambiguous: ambiguous && bestScore > 0
  };
}

/**
 * Get Strong exercise ID by name
 */
function getStrongExerciseId(name) {
  const exercise = strongExercisesData.exercises.find(ex => ex.name === name);
  return exercise ? exercise.id : null;
}

/**
 * Main function to map exercises
 */
function mapExercises() {
  console.log('Analyzing and mapping exercises...');
  
  // Normalize Strong exercises
  const normalizedStrong = strongExercises.map(normalizeExercise);
  
  // Find exact matches
  const exactMatches = fitocracyExercises.filter(ex => strongExercises.includes(ex));
  console.log(`Found ${exactMatches.length} exact matches`);
  
  // Process remaining Fitocracy exercises
  const remainingFitocracy = fitocracyExercises.filter(ex => !exactMatches.includes(ex));
  const normalizedFitocracy = remainingFitocracy.map(normalizeExercise);
  
  // Find best matches for each Fitocracy exercise
  const matches = [];
  const ambiguousMatches = [];
  const noMatches = [];
  
  for (const fitEx of normalizedFitocracy) {
    const { match, score, ambiguous } = findBestMatch(fitEx, normalizedStrong);
    
    if (match && score >= 60) {
      if (ambiguous) {
        ambiguousMatches.push({
          fitocracy: fitEx.original,
          strong: match.original,
          score,
          strongId: getStrongExerciseId(match.original)
        });
      } else {
        matches.push({
          fitocracy: fitEx.original,
          strong: match.original,
          score,
          strongId: getStrongExerciseId(match.original)
        });
      }
    } else if (match && score >= 30) {
      ambiguousMatches.push({
        fitocracy: fitEx.original,
        strong: match.original,
        score,
        strongId: getStrongExerciseId(match.original)
      });
    } else {
      noMatches.push({
        fitocracy: fitEx.original,
        normalized: fitEx.normalized,
        equipment: fitEx.equipment
      });
    }
  }
  
  // Add exact matches to the matches array
  for (const exactMatch of exactMatches) {
    matches.push({
      fitocracy: exactMatch,
      strong: exactMatch,
      score: 100,
      strongId: getStrongExerciseId(exactMatch)
    });
  }
  
  // Sort matches by score (descending)
  matches.sort((a, b) => b.score - a.score);
  ambiguousMatches.sort((a, b) => b.score - a.score);
  
  // Generate mapping report
  const report = {
    summary: {
      totalFitocracyExercises: fitocracyExercises.length,
      totalStrongExercises: strongExercises.length,
      exactMatches: exactMatches.length,
      confidentMatches: matches.length - exactMatches.length,
      ambiguousMatches: ambiguousMatches.length,
      noMatches: noMatches.length
    },
    matches,
    ambiguousMatches,
    noMatches
  };
  
  // Write mapping to file
  fs.writeFileSync(
    'exercise_mapping.json', 
    JSON.stringify(report, null, 2)
  );
  
  console.log('Exercise mapping complete!');
  console.log(`- ${report.summary.exactMatches} exact matches`);
  console.log(`- ${report.summary.confidentMatches} confident matches`);
  console.log(`- ${report.summary.ambiguousMatches} ambiguous matches`);
  console.log(`- ${report.summary.noMatches} unmatched exercises`);
  console.log('Mapping saved to exercise_mapping.json');
  
  return report;
}

// If this script is run directly, execute the mapping
if (require.main === module) {
  mapExercises();
}

module.exports = {
  mapExercises,
  normalizeExercise,
  getStrongExerciseId
};
