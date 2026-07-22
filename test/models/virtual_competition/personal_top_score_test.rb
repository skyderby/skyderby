require 'test_helper'

class VirtualCompetition::PersonalTopScoreTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:distance_in_time)

    profile = profiles(:john)
    3.times do |index|
      track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2015-01-03') + index.years
      @competition.results.create(track: track, result: 100 * (index + 1))
      @competition.results.create(track: track, result: 90 * (index + 1), wind_cancelled: true)
    end

    profile = profiles(:travis)
    3.times do |index|
      track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2015-01-03') + index.years
      @competition.results.create(track: track, result: 70 * (index + 1))
      @competition.results.create(track: track, result: 60 * (index + 1), wind_cancelled: true)
    end
  end

  test 'return correct non wind cancelled results' do
    results = @competition.personal_top_scores.wind_cancellation(false)

    assert_equal 2, results.count
    assert_equal 300, results.first.result
    assert_equal 210, results.second.result
  end

  test 'return correct wind cancelled results' do
    results = @competition.personal_top_scores.wind_cancellation(true)

    assert_equal 2, results.count
    assert_equal 270, results.first.result
    assert_equal 180, results.second.result
  end

  test 'ranks the best result per profile in descending order' do
    results = @competition.personal_top_scores.wind_cancellation(false).order(:rank).to_a

    assert_equal [profiles(:john).id, profiles(:travis).id], results.map(&:profile_id)
    assert_equal [300, 210], results.map(&:result)
    assert_equal [1, 2], results.map(&:rank)
  end

  test 'keeps only the single best track per profile' do
    john_scores = @competition.personal_top_scores.wind_cancellation(false)
                              .where(profile_id: profiles(:john).id)

    assert_equal 1, john_scores.count
    assert_equal 300, john_scores.first.result
  end

  test 'eager loads virtual_competition through a join without missing-column errors' do
    relation = @competition.personal_top_scores
                           .wind_cancellation(false)
                           .includes(:virtual_competition)
                           .references(:virtual_competition)

    results = assert_nothing_raised { relation.to_a }

    assert_equal 2, results.size
    assert_equal [@competition], results.map(&:virtual_competition).uniq
    assert_equal [300, 210].sort, results.map(&:result).sort
  end
end
