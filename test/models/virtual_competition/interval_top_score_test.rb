require 'test_helper'

class VirtualCompetition::IntervalTopScoreTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:base_race).tap(&:custom_intervals)
    @previous_interval = @competition.custom_intervals.create!(
      name: '1st month',
      period_from: Time.zone.parse('2016-01-01'),
      period_to: Time.zone.parse('2016-01-31')
    )
    @current_interval = @competition.custom_intervals.create!(
      name: '2nd month',
      period_from: Time.zone.parse('2016-02-01'),
      period_to: Time.zone.parse('2016-02-28')
    )
    @profile = profiles(:john)

    3.times do |index|
      track = create :empty_track, pilot: @profile, recorded_at: Time.zone.parse('2016-02-02')
      @competition.results.create(track: track, result: 100 * (index + 1))
      @competition.results.create(track: track, result: 200 * (index + 1), wind_cancelled: true)
    end

    track = create :empty_track, pilot: @profile, recorded_at: Time.zone.parse('2016-01-08')
    @competition.results.create(track: track, result: 50)
  end

  test 'takes best result only in current interval with wind_cancellation enabled' do
    results = @competition.interval_top_scores.for(@current_interval).wind_cancellation(false)

    assert_equal 1, results.count
    assert_equal 100, results.first.result
  end

  test 'takes best result only in current interval with wind_cancellation disabled' do
    results = @competition.interval_top_scores.for(@current_interval).wind_cancellation(true)

    assert_equal 1, results.count
    assert_equal 200, results.first.result
  end
end
