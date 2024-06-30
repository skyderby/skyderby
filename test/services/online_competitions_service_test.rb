require 'test_helper'

class OnlineCompetitionsServiceTest < ActiveSupport::TestCase
  test 'Distance in time competition' do
    competition = virtual_competitions(:distance_in_time)

    track = create_track_from_file '06-38-21_SimonP.CSV', kind: :base

    OnlineCompetitionsService.score_track(track)

    results = competition.results.where(track: track)
    assert_equal 1, results.count

    record = results.first
    assert_in_delta 701.37, record.result, 0.01
    assert_in_delta 2.09, record.highest_gr, 0.01
    assert_in_delta 203, record.highest_speed, 1
  end

  test 'BASE Race' do
    competition = virtual_competitions(:base_race)

    track = create_track_from_file 'WBR/Yegor_16_Round3.CSV', kind: :base, place: places(:hellesylt)

    OnlineCompetitionsService.score_track(track)

    results = competition.results.where(track: track)
    assert_equal 1, results.count

    record = results.first
    assert_in_delta 28.5, record.result, 0.1
  end

  test 'Skydive distance prior to 2020' do
    place = create :place, name: 'Ravenna', msl: 0
    competition = virtual_competitions(:skydive_distance_wingsuit)

    track = create_track_from_file(
      '13-31-51_Ravenna.CSV',
      place_id: place.id,
      kind: :skydive
    )

    OnlineCompetitionsService.score_track(track)

    results = competition.results.where(track: track)
    assert_equal 1, results.count

    record = results.first
    assert_not record.wind_cancelled
    assert_in_delta 3410, record.result, 1
  end

  test 'Skydive distance with wind cancellation' do
    place = create :place, name: 'Ravenna', msl: 0
    competition = virtual_competitions(:skydive_distance_wingsuit)
    place.weather_data.create!(
      actual_on: '2017-06-03T11:00:00Z',
      altitude: 0,
      wind_speed: 10,
      wind_direction: 180
    )

    track = create_track_from_file(
      '13-31-51_Ravenna.CSV',
      place_id: place.id,
      kind: :skydive
    )

    OnlineCompetitionsService.score_track(track)

    results = competition.results.where(track: track)
    assert_equal 2, results.count

    record = results.find { |result| !result.wind_cancelled }
    assert_not record.wind_cancelled
    assert_in_delta 3410, record.result, 1

    wind_cancelled_record = results.find(&:wind_cancelled)
    assert wind_cancelled_record.wind_cancelled
    assert_in_delta 3324, wind_cancelled_record.result, 1
  end

  # For current track results are
  # 3500-2500 2847
  # 3000-2000 3410
  #
  # We set ground elevation to 500 meters to lower data by 500 meters
  # So 3000-2000 range should be chosen
  test 'Skydive distance starting 2020' do
    place = create :place, name: 'Ravenna', msl: 500
    competition = virtual_competitions(:skydive_distance_wingsuit)

    track = create_track_from_file(
      '13-31-51_Ravenna.CSV',
      place_id: place.id,
      kind: :skydive,
      recorded_at: Date.parse('2020-01-01')
    )

    OnlineCompetitionsService.score_track(track)

    results = competition.results.where(track: track)
    assert_equal 1, results.count

    record = results.first
    assert_not record.wind_cancelled
    assert_in_delta 3410, record.result, 1
  end

  test 'When one range out of data recorded' do
    place = create :place, name: 'Ravenna', msl: 1000
    competition = virtual_competitions(:skydive_distance_wingsuit)

    track = create_track_from_file(
      '13-31-51_Ravenna.CSV',
      place_id: place.id,
      kind: :skydive,
      recorded_at: Date.parse('2020-01-01')
    )

    OnlineCompetitionsService.score_track(track)

    results = competition.results.where(track: track)
    assert_equal 1, results.count

    record = results.first
    assert_in_delta 2847, record.result, 1
  end
end
