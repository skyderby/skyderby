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

  test 'keeps only the single best track per profile within the interval' do
    results = @competition.interval_top_scores.for(@current_interval).wind_cancellation(false)
                          .where(profile_id: @profile.id)

    assert_equal 1, results.count
    assert_equal 100, results.first.result
  end

  test 'ranks profiles ascending for base_race within the interval' do
    other = profiles(:travis)
    track = create :empty_track, pilot: other, recorded_at: Time.zone.parse('2016-02-02')
    @competition.results.create(track: track, result: 150)

    results = @competition.interval_top_scores.for(@current_interval).wind_cancellation(false).order(:rank).to_a

    assert_equal [@profile.id, other.id], results.map(&:profile_id)
    assert_equal [100, 150], results.map(&:result)
    assert_equal [1, 2], results.map(&:rank)
  end

  test 'eager loads virtual_competition through a join without missing-column errors' do
    relation = @competition.interval_top_scores.for(@current_interval)
                           .wind_cancellation(false)
                           .includes(:virtual_competition)
                           .references(:virtual_competition)

    results = assert_nothing_raised { relation.to_a }

    assert_equal 1, results.size
    assert_equal @competition, results.first.virtual_competition
    assert_equal 100, results.first.result
  end
end
