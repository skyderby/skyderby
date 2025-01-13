require 'test_helper'

class VirtualCompetition::AnnualTopScoreTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:skydive_distance_wingsuit)
    @profile = profiles(:john)

    track = create :empty_track, pilot: @profile, recorded_at: Time.zone.parse('2015-02-02')
    @competition.results.create(track: track, result: 2200)
    @competition.results.create(track: track, result: 2000, wind_cancelled: true)
    track = create :empty_track, pilot: @profile, recorded_at: Time.zone.parse('2016-02-02')
    @competition.results.create(track: track, result: 3000)
    @competition.results.create(track: track, result: 2400, wind_cancelled: true)

    track = create :empty_track, pilot: @profile, recorded_at: Time.zone.parse('2017-01-08')
    @competition.results.create(track: track, result: 5000)
    @competition.results.create(track: track, result: 4500, wind_cancelled: true)
  end

  test 'with wind_cancellation enabled' do
    results = @competition.annual_top_scores.wind_cancellation(true).where(year: 2016)

    assert_equal 1, results.count
    assert_equal 2400, results.first.result
  end

  test 'with wind_cancellation disabled' do
    results = @competition.annual_top_scores.wind_cancellation(true).where(year: 2017)

    assert_equal 1, results.count
    assert_equal 4500, results.first.result
  end
end
