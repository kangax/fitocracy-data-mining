let selectedExercise = data['Barbell Bench Press'];

class ExerciseDetails extends React.Component {
  render() {
    if (!this.props.selectedExercise) {
      return (
        <div className="exercise-details">Nothing selected</div>
      );
    }
    return (
      <div className="exercise-details">
        <h4>{ this.props.selectedExercise[0].actions[0].action.name }</h4>
        <ul onClick={this._handleClick}>
          { this.props.selectedExercise.map(this._renderSession) }
        </ul>
      </div>
    );
  }
  _handleClick(e) {
    // console.log(e.target);
  }
  _renderSession(session) {
    return (
      <li>
        <p title="{session.date}">
          {
            session.actions.map(
              (set) => set.effort1 + '×' + Math.round(set.effort0_imperial))
                .join(' · ')
          }
        </p>
      </li>
    )
  }
}

class ExerciseList extends React.Component {
  render() {
    return (
      <table className="table table-bordered table-hover exercise-list">
        <thead>
          <th>Name</th>
          <th>Workouts</th>
          <th>Sets</th>
          <th>Reps</th>
          <th>Unit</th>
          <th>Kg's</th>
        </thead>
        <tbody>
          { this._renderBody() }
        </tbody>
      </table>
    );
  }
  _renderBody() {
    return Object.keys(this.props.data)
      .map((prop) => this.props.data[prop])
      .map((exercise) => this._renderRow(exercise));
  }
  _renderRow(exercise) {

    var sets = _.flatten(exercise.map(function(o) { return o.actions }));
    var reps = sets.map(function(o) { return o.effort1 });
    var totalReps = _.sum(reps);

    var metricUnit = sets.find(function(o) {
      return o.effort1_metric;
    });

    var totalKg = _.sum(_.flatten(sets.map(function(o){ return o.effort0_metric })));

    var unitAbbr = (metricUnit && metricUnit.effort1_metric_unit)
      ? metricUnit.effort1_metric_unit.abbr
      : '';

    return (
      <tr>
        <td>{ exercise[0].actions[0].action.name }</td>
        <td>{ exercise.length }</td>
        <td>{ sets.length }</td>
        <td>{ totalReps ? totalReps.toFixed(0) : '' }</td>
        <td>{ unitAbbr }</td>
        <td>{ (unitAbbr === 'reps' && totalKg !== 0) ? totalKg.toFixed(0) : '' }</td>
      </tr>
    );
  }
}

class Viewer extends React.Component {
  render() {
    return (
      <div>
        <p>
          <b>Total exercises</b>: { Object.keys(data).length }
        </p>
        <p>
          <input placeholder="Filter by ..." className="filter-exercises" />
        </p>
        <div>
          <ExerciseList data={ this.props.data } />
          <ExerciseDetails selectedExercise={ data['Barbell Bench Press'] } />
        </div>>
      </div>
    )
  }
}

ReactDOM.render(
  <Viewer data={data} />,
  document.getElementById('wrapper')
);
