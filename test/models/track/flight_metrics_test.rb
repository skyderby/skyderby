require 'test_helper'

class Track::FlightMetricsTest < ActiveSupport::TestCase
  setup do
    @track = create_track_from_file('WBR/Yegor_16_Round3.CSV', kind: :base)
    @track.update!(ff_end: 49)
  end

  test 'measures the altitude window like the online ranking scores it' do
    window = metrics('distance_in_altitude', 200).window
    scored = WindowRangeFinder.new(scoring_points).execute(from_vertical_speed: 10, elevation: 200)

    assert_in_delta scored.distance, window['result'], 0.1
    assert_in_delta window['result'], window['distance'], 0.1
    assert_in_delta 200, window['elevation'], 0.5
    assert_operator window['checkpoints']['6']['lost'], :>, window['checkpoints']['4']['lost']
    assert_operator window['peak_glide'], :>=, window['end_glide']
  end

  test 'measures a time window' do
    window = metrics('distance_in_time', 5).window

    assert_in_delta 5, window['duration'], 0.1
    assert_operator window['result'], :>, 0
  end

  test 'skips the window when the jump does not reach it' do
    assert_nil metrics('distance_in_altitude', 5000).window
  end

  test 'measures a flare still climbing at deployment up to its peak' do
    flare = Track::FlightMetrics.new(@track).flare

    assert_in_delta 23.6, flare['gain'], 0.1
    assert_operator flare['max_total_speed_before'], :>=, flare['max_h_speed_before']
    assert_predicate flare['series'].first.first, :negative?
    assert_includes 0.0..1.0, flare['efficiency']
  end

  test 'measures the skydive performance window like the online ranking scores each task' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file('13-31-51_Ravenna.CSV', place_id: place.id, kind: :skydive)
    Track::Result::Calculation.run(track)

    %w[distance time speed].each do |task|
      part = Track::Debrief::Discipline::Part.new(discipline: task, parameter: 0, finish_line_id: nil,
                                                  results_sort_order: 'descending')
      window = Track::FlightMetrics.new(track, window_spec: Track::FlightMetrics.window_spec_for(part)).window
      scored = track.results.find_by(discipline: task, variant: Track::Result::COMPETITION_VARIANT).result

      assert_in_delta scored, window['result'], scored * 0.01, task
      assert_in_delta 1000, window['elevation'], 5
      assert_includes [3000, 2500], window['from_altitude']
      assert_operator window['avg_v_speed'], :>, 0
      assert window['checkpoints'].key?('10')
    end
  end

  test 'adds the run-up before a performance window and the shape of the window' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file('13-31-51_Ravenna.CSV', place_id: place.id, kind: :skydive)
    part = Track::Debrief::Discipline::Part.new(discipline: 'time', parameter: 2500, finish_line_id: nil,
                                                results_sort_order: 'descending')

    window = Track::FlightMetrics.new(track, window_spec: Track::FlightMetrics.window_spec_for(part)).window

    assert_operator window['run_up']['duration'], :>, 0
    assert_operator window['run_up']['height'], :>, 0
    assert window['run_up'].key?('entry_v_speed_change')
    assert_predicate window['series'].first.first, :negative?
    assert_equal 3, window['shape']['thirds']['v_speed'].size
    assert_equal [150, 500, 850, 1000], window['segments'].pluck('to_lost')
    assert_in_delta window['result'], window['segments'].sum { |segment| segment['time'] }, 0.3
    assert_operator window['run_up']['top_speed'], :>=, window['run_up']['entry_total_speed']
    assert_operator window['shape']['v_speed_spread'], :>=, 0
  end

  test 'skips the run-up for windows that start at exit' do
    window = metrics('distance_in_altitude', 200).window

    assert_nil window['run_up']
    assert_operator window['series'].first.first, :>=, 0
  end

  test 'scales flare efficiency by the best flares of the jump kind' do
    base = Track::FlightMetrics.new(@track).flare
    @track.update!(kind: :skydive)
    skydive = Track::FlightMetrics.new(@track.reload).flare

    assert_in_delta base['possible_gain'] * 0.31 / 0.27, skydive['possible_gain'], 0.2
  end

  private

  def metrics(discipline, parameter)
    part = Track::Debrief::Discipline::Part.new(discipline:, parameter:, finish_line_id: nil,
                                                results_sort_order: 'descending')
    Track::FlightMetrics.new(@track, window_spec: Track::FlightMetrics.window_spec_for(part), flare: false)
  end

  def scoring_points(trimmed: { seconds_before_start: 10 })
    raw = PointsQuery.execute(@track, trimmed:, only: Track::FlightMetrics::POINT_COLUMNS)
    PointsPostprocessor.for(@track.gps_type).call(raw)
  end
end
