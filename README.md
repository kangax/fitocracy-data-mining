## What does this do that Fito doesn't?

- Shows **1RM, 2RM, ..., 15RM** for each exercise (i.e. which max weight you've done for 2, 3, 4, etc. reps)
- Shows **estimated 1RM** according to your heaviest set (rep x weight)
- Shows **total performed sets, reps, volume** (sets x reps x weight)
- Allows to **filter and find exercise** quickly using regular expression
- Shows all of your sessions/sets/reps **at a glance, with easy access to notes**

## Fetching data

### Step 1

Replace USER_ID with yours and execute this in console.

```js
var USER_ID = 30591;

$.get('https://www.fitocracy.com/get_user_activities/' + USER_ID).done(function(activityDefs) {
  var activities = window.__activities = { };
  var remaining = activityDefs.length;

  activityDefs.forEach(function(activityDef, index) {
    var activityUrl = 'https://www.fitocracy.com/_get_activity_history_json/?activity-id=' + activityDef.id;

    $.get(activityUrl).done(function(json) {
      activities[activityDef.name] = json;
      console.log('Fetched', activityDef.name, '. Remaining: ', remaining--);
    });
  });
});
```


### STEP 2

The code above will create a pretty big object (~84MB in my case) so we need to cleanup the data.
Execute in console after everything in step 1 is fetched.

```js
Object.keys(__activities).forEach(function(activityName) {
  __activities[activityName].forEach(function(session) {
    session.actions.forEach(function(action) {
      delete action.user;
      delete action.api_id;
      delete action.api_source;
      delete action.allow_share;
      delete action.submitted;
      delete action.subgroup; // could this be useful?
      delete action.subgroup_order; // and this?
      delete action.action_group_id;
      delete action.is_pr;
      delete action.id; // do we need this?

      // redundant
      // delete action.action.name;
      delete action.action.set_name;

      if (!action.notes) {
        delete action.notes;
      }

      ['0', '1', '2', '3', '4', '5'].forEach(function(num) {
        if (action['effort' + num] === null) {
          delete action['effort' + num];
          delete action['effort' + num + '_imperial'];
          delete action['effort' + num + '_imperial_string'];
          delete action['effort' + num + '_imperial_unit'];
          delete action['effort' + num + '_metric'];
          delete action['effort' + num + '_metric_string'];
          delete action['effort' + num + '_metric_unit'];
          delete action['effort' + num + '_string'];
          delete action['effort' + num + '_unit'];
        }
        else {
          delete action['effort' + num + '_unit'].id;
          delete action['effort' + num + '_unit'].name;
        }
      });
    });
  });
});

copy(JSON.stringify(__activities));
```

### STEP 3

Your buffer has all the data; paste it to data.js

## Other apps that export Fitocracy data

- https://github.com/thegreatape/fitocracy-export
- https://github.com/luketurner/fitocracy-export
- http://www.romanito.com/fitnotes/

## TODO

- Add table sorting
- Fix time-based exercises like L-Sit
- Fix distance-based exercises like Walking
