Object.entries(data).forEach(([prop, sessions]) => { 
    sessions.forEach(session => { 
        delete session.id;
        delete session.date;

        session.actions.forEach((set, index) => { 
            delete set.string; 
            delete set.string_imperial; 
            delete set.string_metric;
            delete set.actiondate;

            if (set.effort1_unit?.abbr === 'reps' || set.effort1_unit === 'reps') { 
                delete set.effort1_imperial_unit; 
                delete set.effort1_imperial; 
                delete set.effort1_metric_unit; 
                delete set.effort1_metric; 
                delete set.effort1_imperial_string;
                delete set.effort1_metric_string;
                delete set.effort1_string;
            }
            if (set.effort0_unit?.abbr === 'lb' || set.effort0_unit?.abbr === 'kg' || set.effort0_unit === 'lb' || set.effort0_unit === 'kg') { 
                delete set.effort0_imperial_string; 
                delete set.effort0_metric_string;
                delete set.effort0_string;
                
                delete set.effort0_imperial_unit;
                delete set.effort0_metric_unit;

                if (!Number.isInteger(set.effort0_imperial) && Number.isInteger(set.effort0_metric)) {
                    delete set.effort0_imperial;
                }
                if (!Number.isInteger(set.effort0_metric) && Number.isInteger(set.effort0_imperial)) {
                    delete set.effort0_metric;
                }
                delete set.effort0;
                delete set.effort0_unit;
            }

            delete set.action.id;
            delete set.action.actiontype;

            for (let i = 0; i <= 5; i++) {
                if (!set.action[`effort${i}`]) {
                    delete set.action[`effort${i}`];
                    delete set.action[`effort${i}_label`];
                }
            }

            if (index === 0) {
                session.action = set.action;
                session.actiontime = set.actiontime;
                if (set.notes) {
                    session.notes = set.notes;
                }
            }
            delete set.action;
            delete set.actiontime;
            delete set.notes;

            delete set.points;
        }) 
    }) 
})