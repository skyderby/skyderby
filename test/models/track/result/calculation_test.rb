require 'test_helper'

class Track::Result::CalculationTest < ActiveSupport::TestCase
  test 'records best and competition skydive results as separate variants' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file('13-31-51_Ravenna.CSV', place_id: place.id, kind: :skydive)

    Track::Result::Calculation.run(track)

    best = track.results.find_by(discipline: :distance, variant: Track::Result::BEST_VARIANT)
    competition = track.results.find_by(discipline: :distance, variant: Track::Result::COMPETITION_VARIANT)

    assert best
    assert_in_delta 3410, competition.result, 1
  end

  test 'legacy time/distance/speed associations return only the best variant' do
    place = create :place, name: 'Ravenna', msl: 0
    track = create_track_from_file('13-31-51_Ravenna.CSV', place_id: place.id, kind: :skydive)

    Track::Result::Calculation.run(track)

    assert_equal Track::Result::BEST_VARIANT, track.distance.variant
    assert_equal Track::Result::BEST_VARIANT, track.speed.variant
    assert_equal Track::Result::BEST_VARIANT, track.time.variant
    assert_equal 1, track.results.where(discipline: :distance, variant: Track::Result::BEST_VARIANT).count
  end

  test 'records distance in time results for 20/25/30 second windows' do
    track = create_track_from_file('06-38-21_SimonP.CSV', kind: :base)

    Track::Result::Calculation.run(track)

    variants = track.results.where(discipline: :distance_in_time).pluck(:variant).sort
    assert_equal %w[20 25 30], variants

    twenty = track.results.find_by(discipline: :distance_in_time, variant: '20')
    assert_in_delta 701.37, twenty.result, 0.5
  end

  test 'records a base race result per finish line of the place' do
    track = create_track_from_file('WBR/Yegor_16_Round3.CSV', kind: :base, place: places(:hellesylt))

    Track::Result::Calculation.run(track)

    finish_line = place_finish_lines(:hellesylt)
    result = track.results.find_by(discipline: :base_race, variant: finish_line.id.to_s)

    assert result
    assert_in_delta 28.5, result.result, 0.1
  end
end
