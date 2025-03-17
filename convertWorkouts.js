/**
 * Convert Strong App CSV to separate exercise and session JSON files
 * @param {string} csvPath - Path to CSV file from Strong app
 * @param {string} outputDir - Directory to write the output JSON files
 */
function convertStrongCsvToSeparateJson(csvPath, outputDir) {
    const fs = require('fs');
    const path = require('path');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Read the CSV file
    console.log(`Reading CSV file: ${csvPath}`);
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV more carefully
    let rows = csvContent.split('\n').filter(row => row.trim());
    const headers = parseCSVRow(rows[0]);
    const dataLines = rows.slice(1);
    
    console.log(`Processing ${dataLines.length} entries`);
    
    // Parse all rows carefully
    const parsedRows = [];
    for (const row of dataLines) {
      try {
        const values = parseCSVRow(row);
        const obj = {};
        
        headers.forEach((header, index) => {
          // Ensure we have a value for this column
          if (index < values.length) {
            obj[header] = values[index];
          } else {
            obj[header] = '';
          }
        });
        
        parsedRows.push(obj);
      } catch (err) {
        console.error(`Error parsing row: ${row}`);
        console.error(err);
      }
    }
    
    // Function to parse a CSV row properly handling quoted values
    function parseCSVRow(row) {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // Don't forget the last field
      result.push(current.trim());
      
      return result;
    }
    
    // Helper functions
    const formatDate = (dateStr) => dateStr.split(' ')[0];
    const formatTime = (dateStr) => dateStr.split(' ')[1];
    
    const parseDuration = (durationStr) => {
      if (!durationStr) return null;
      
      let minutes = 0;
      if (durationStr.includes('h')) {
        const parts = durationStr.split(' ');
        const hours = parseInt(parts[0].replace('h', ''));
        minutes += hours * 60;
        if (parts.length > 1) {
          minutes += parseInt(parts[1].replace('m', ''));
        }
      } else {
        minutes = parseInt(durationStr.replace('m', ''));
      }
      return minutes;
    };
    
    const determineExerciseType = (name) => {
      if (!name) return 'resistance'; // Default
      const lname = name.toLowerCase();
      
      if (lname.includes('plank') || lname.includes('hold') || lname.includes('hang') || 
          lname.includes('static') || lname.includes('l-sit')) {
        return 'duration';
      }
      
      if (lname.includes('run') || lname.includes('walking') || 
          (lname.includes('row') && lname.includes('machine')) || 
          lname.includes('bike') || lname.includes('cycling') ||
          lname.includes('carry')) {
        return 'distance';
      }
      
      if (lname.includes('burpee') || lname.includes('wall ball') || 
          lname.includes('box jump') || lname.includes('kettlebell swing') ||
          lname.includes('thruster') || lname.includes('double under')) {
        return 'complex';
      }
      
      return 'resistance'; // Most exercises are resistance-based
    };
    
    const categorizeExercise = (name) => {
      const lname = name.toLowerCase();
      
      if (lname.includes('squat') || lname.includes('deadlift') || 
          lname.includes('lunge') || lname.includes('leg press')) {
        return 'Lower Body';
      } 
      
      if (lname.includes('bench press') || lname.includes('chest press') || 
          lname.includes('push') || lname.includes('shoulder press') ||
          lname.includes('overhead press') || lname.includes('dip')) {
        return 'Upper Body Push';
      }
      
      if (lname.includes('row') || lname.includes('pull') || 
         lname.includes('curl') || lname.includes('lat pulldown') ||
         lname.includes('chin')) {
        return 'Upper Body Pull';
      }
      
      if (lname.includes('clean') || lname.includes('snatch') || 
         lname.includes('jerk')) {
        return 'Olympic Lifting';
      }
      
      if (lname.includes('sit up') || lname.includes('crunch') || 
         lname.includes('plank') || lname.includes('ab ') ||
         lname.includes('twist')) {
        return 'Core';
      }
      
      if (lname.includes('run') || lname.includes('row') || 
         lname.includes('bike') || lname.includes('jump rope')) {
        return 'Cardio';
      }
      
      return null; // Will be omitted if null
    };
    
    // Helper to safely parse numbers
    function safeParseFloat(value) {
      if (value === undefined || value === null || value === '') return 0;
      
      // Remove any quotes
      if (typeof value === 'string') {
        value = value.replace(/^["']|["']$/g, '');
      }
      
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    function safeParseInt(value) {
      if (value === undefined || value === null || value === '') return 0;
      
      // Remove any quotes
      if (typeof value === 'string') {
        value = value.replace(/^["']|["']$/g, '');
      }
      
      const parsed = parseInt(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // Extract unique exercises from all data
    const exercises = [];
    const exerciseMap = {};
    
    parsedRows.forEach(row => {
      const exerciseName = row['Exercise Name'];
      
      if (exerciseName && !exerciseMap[exerciseName]) {
        const id = exercises.length + 1;
        
        const exercise = {
          id,
          name: exerciseName,
          primaryType: determineExerciseType(exerciseName)
        };
        
        // Extract base exercise and modifier
        if (exerciseName.includes('(')) {
          exercise.baseExercise = exerciseName.split('(')[0].trim();
          const modifierMatch = exerciseName.match(/\((.*?)\)/);
          if (modifierMatch && modifierMatch[1]) {
            exercise.modifier = modifierMatch[1];
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
            exercise.equipment = equipment;
            break;
          }
        }
        
        // Add category if available
        const category = categorizeExercise(exerciseName);
        if (category) {
          exercise.category = category;
        }
        
        exerciseMap[exerciseName] = exercise;
        exercises.push(exercise);
      }
    });
    
    console.log(`Found ${exercises.length} unique exercises`);
    
    // Save exercises to a separate file
    const exercisesFile = path.join(outputDir, 'exercises.json');
    const exercisesJson = {
      metadata: {
        exportDate: new Date().toISOString(),
        count: exercises.length
      },
      exercises
    };
    
    fs.writeFileSync(exercisesFile, JSON.stringify(exercisesJson, null, 2));
    console.log(`Exercises saved to ${exercisesFile}`);
    
    // Group rows by year
    const rowsByYear = {};
    
    parsedRows.forEach(row => {
      const date = row['Date'];
      if (!date) return;
      
      const year = date.split('-')[0];
      if (!rowsByYear[year]) {
        rowsByYear[year] = [];
      }
      
      rowsByYear[year].push(row);
    });
    
    // Process each year separately
    const yearStats = {};
    
    for (const [year, yearRows] of Object.entries(rowsByYear)) {
      console.log(`\nProcessing ${yearRows.length} entries for ${year}`);
      
      // Group into sessions
      const sessionMap = {};
      
      yearRows.forEach(row => {
        const dateStr = row['Date'] || '';
        if (!dateStr) return;
        
        const dateParts = dateStr.split(' ');
        const date = dateParts[0];
        const time = dateParts.length > 1 ? dateParts[1] : '';
        
        const workoutName = row['Workout Name'] || 'Untitled';
        const sessionKey = `${date}|${workoutName}`;
        
        if (!sessionMap[sessionKey]) {
          const session = {
            date,
            time,
            name: workoutName,
            exercises: {}
          };
          
          // Add duration if available
          const duration = parseDuration(row['Duration']);
          if (duration) {
            session.duration = duration;
          }
          
          // Add notes if available
          if (row['Workout Notes'] && row['Workout Notes'].trim() !== '') {
            session.notes = row['Workout Notes'];
          }
          
          sessionMap[sessionKey] = session;
        }
        
        const session = sessionMap[sessionKey];
        const exerciseName = row['Exercise Name'];
        const exercise = exerciseMap[exerciseName];
        
        if (!exercise) return; // Skip if exercise not found
        
        if (!session.exercises[exercise.id]) {
          session.exercises[exercise.id] = {
            exerciseId: exercise.id,
            sets: []
          };
        }
        
        // Create a set based on exercise type
        const set = {};
        
        // Safely parse numeric values
        const weight = safeParseFloat(row['Weight']);
        const reps = safeParseInt(row['Reps']);
        const distance = safeParseFloat(row['Distance']);
        const seconds = safeParseInt(row['Seconds']);
        
        // Validate data - check for weird values
        if (reps > 100) {
          console.warn(`Warning: Unusually high reps value (${reps}) for ${exerciseName}`);
        }
        
        if (weight > 1000) {
          console.warn(`Warning: Unusually high weight value (${weight}) for ${exerciseName}`);
        }
        
        // Verify values make sense for exercise type
        // For Olympic lifts, weight should be significant and reps usually low
        if (exercise.category === 'Olympic Lifting' && reps > 30) {
          console.warn(`Warning: Olympic lift ${exerciseName} has ${reps} reps, possible data issue`);
        }
        
        switch (exercise.primaryType) {
          case 'resistance':
            if (reps > 0) set.reps = reps;
            if (weight > 0) {
              set.weight = {
                value: weight,
                unit: 'pound' // More descriptive unit
              };
            }
            break;
            
          case 'distance':
            if (distance > 0) {
              // Strong app uses miles by default for distance
              set.distance = {
                value: distance,
                unit: 'mile' // Correct unit and more descriptive
              };
            }
            if (seconds > 0) set.seconds = seconds;
            if (weight > 0) {
              set.primaryLoad = {
                value: weight,
                unit: 'pound'
              };
            }
            break;
            
          case 'duration':
            if (seconds > 0) set.seconds = seconds;
            if (reps > 0) set.reps = reps;
            if (weight > 0) {
              set.weight = {
                value: weight,
                unit: 'pound'
              };
            }
            break;
            
          case 'complex':
            if (reps > 0) set.reps = reps;
            if (seconds > 0) set.seconds = seconds;
            if (weight > 0) {
              set.primaryLoad = {
                value: weight,
                unit: 'pound'
              };
            }
            if (distance > 0) {
              set.distance = {
                value: distance,
                unit: 'mile'
              };
            }
            
            // Box jump heights
            if (exerciseName.toLowerCase().includes('box jump')) {
              const heightMatch = exerciseName.match(/\((\d+)[""]?\)/);
              if (heightMatch) {
                set.height = {
                  value: parseInt(heightMatch[1]),
                  unit: 'inch' // More descriptive unit
                };
              }
            }
            break;
        }
        
        // Add notes if available
        if (row['Notes'] && row['Notes'].trim() !== '') {
          set.notes = row['Notes'];
        }
        
        // Add RPE if available
        if (row['RPE'] && row['RPE'].trim() !== '') {
          const rpe = safeParseFloat(row['RPE']);
          if (rpe > 0) set.rpe = rpe;
        }
        
        // Check for weight vest in notes
        if (set.notes && typeof set.notes === 'string' && set.notes.toLowerCase().includes('vest')) {
          const vestMatch = set.notes.match(/(\d+)\s*lb\s+vest/i);
          if (vestMatch) {
            set.additionalLoad = {
              weight: {
                value: parseInt(vestMatch[1]),
                unit: 'pound'
              },
              type: 'vest'
            };
          }
        }
        
        // Add special debugging for problematic values
        if ((exercise.name.includes('Clean') && reps > 30) || 
            (reps > 50 && weight > 0 && weight < 5)) {
          set._debug = {
            originalWeight: row['Weight'],
            originalReps: row['Reps'],
            setOrder: row['Set Order']
          };
        }
        
        // Only add sets with data
        if (Object.keys(set).length > 0) {
          session.exercises[exercise.id].sets.push(set);
        }
      });
      
      // Convert to array for final format
      const sessions = Object.values(sessionMap).map(session => {
        return {
          date: session.date,
          time: session.time,
          name: session.name,
          duration: session.duration,
          notes: session.notes,
          exercises: Object.values(session.exercises).map(ex => {
            // Remove empty sets
            const filteredSets = ex.sets.filter(set => {
              // Keep only sets that have at least one non-debug property
              return Object.keys(set).some(key => !key.startsWith('_'));
            });
            return {
              exerciseId: ex.exerciseId,
              sets: filteredSets
            };
          }).filter(ex => ex.sets.length > 0) // Remove exercises with no sets
        };
      }).filter(session => session.exercises.length > 0); // Remove empty sessions
      
      console.log(`Created ${sessions.length} workout sessions for ${year}`);
      
      // Create sessions JSON
      const sessionsJson = {
        metadata: {
          exportDate: new Date().toISOString(),
          year,
          count: sessions.length
        },
        sessions
      };
      
      // Write to file
      const sessionsFile = path.join(outputDir, `sessions_${year}.json`);
      fs.writeFileSync(sessionsFile, JSON.stringify(sessionsJson, null, 2));
      
      // Calculate the JSON size
      const stats = fs.statSync(sessionsFile);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`Sessions for ${year} saved to ${sessionsFile} (${sizeMB} MB)`);
      
      yearStats[year] = {
        entries: yearRows.length,
        sessions: sessions.length,
        jsonSizeMB: sizeMB
      };
    }
    
    // Create a summary file
    const summary = {
      exportDate: new Date().toISOString(),
      totalExercises: exercises.length,
      yearlyStats: yearStats
    };
    
    const summaryFile = path.join(outputDir, 'summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log(`\nSummary saved to ${summaryFile}`);
    console.log(`Conversion complete! Files saved to ${outputDir}`);
    
    return summary;
  }
  
  /**
   * Usage:
   * 
   * // Node.js
   * const fs = require('fs');
   * const path = require('path');
   * 
   * // Call the function
   * convertStrongCsvToSeparateJson('strong_2025_03_15.csv', './workout_data');
   */

  convertStrongCsvToSeparateJson('strong_2025_03_15.csv', './workout_data');