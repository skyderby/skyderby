require 'test_helper'

class Track::Debrief::CatalogTest < ActiveSupport::TestCase
  setup do
    virtual_competitions(:skydive_distance_wingsuit).update_columns(period_to: 1.year.from_now)
    place = create :place, name: 'Ravenna', msl: 0
    @track = create_track_from_file('13-31-51_Ravenna.CSV', place_id: place.id, kind: :skydive,
                                                            suit: suits(:apache))
    @track.update_columns(recorded_at: Time.zone.parse('2024-06-01'))
    @catalog = Track::Debrief::Catalog.new(@track, viewer: users(:regular_user))
  end

  test 'debriefs skydive performance in the 2500-1500 m window only' do
    keys = @catalog.disciplines.map(&:key)

    assert_equal ['distance-2500'], keys
    assert_equal 'distance in the 2500-1500 m window', @catalog.find('distance-2500').parts.first.name
  end

  test 'measures the jump in the debrief window instead of its scored result' do
    inputs = Track::Debrief::Inputs.new(@track, @catalog.find('distance-2500')).to_h
    window = inputs.dig('jump', 'metrics', 'window')

    assert_equal 2500, window['from_altitude']
    assert_in_delta window['result'], inputs.dig('jump', 'results', 'distance', 'result'), 0.1
  end

  test 'tells the model that the field is scored on each pilot best window' do
    debrief = Track::Debrief.new(track: @track, inputs: { 'discipline' => @catalog.find('distance-2500').to_h })

    prompt = Track::Debrief::Prompt.new(debrief).system

    assert_includes prompt, 'always measure jumps in the 2500-1500 m window'
    assert_includes prompt, 'Pilots fly in moving air'
    assert_includes prompt, 'window.run_up.settled_for'
  end
end
