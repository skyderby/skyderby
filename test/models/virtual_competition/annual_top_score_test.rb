require 'test_helper'

class VirtualCompetition::AnnualTopScoreTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:skydive_distance_wingsuit)
    @ascending_competition = virtual_competitions(:base_race)

    @john = profiles(:john)
    @alex = profiles(:alex)
    @travis = profiles(:travis)
  end

  test 'returns results ranked by result value descending' do
    create_result(@competition, @john, result: 2000, recorded_at: '2024-03-01')
    create_result(@competition, @alex, result: 3000, recorded_at: '2024-03-02')
    create_result(@competition, @travis, result: 2500, recorded_at: '2024-03-03')

    scores = VirtualCompetition::AnnualTopScore.for_competition(@competition).for_year(2024)

    assert_equal 3, scores.count
    assert_equal [@alex.id, @travis.id, @john.id], scores.map(&:profile_id)
    assert_equal [1, 2, 3], scores.map(&:rank)
  end

  test 'returns results ranked ascending for base_race competition' do
    create_result(@ascending_competition, @john, result: 30, recorded_at: '2024-03-01')
    create_result(@ascending_competition, @alex, result: 25, recorded_at: '2024-03-02')
    create_result(@ascending_competition, @travis, result: 28, recorded_at: '2024-03-03')

    scores = VirtualCompetition::AnnualTopScore.for_competition(@ascending_competition).for_year(2024)

    assert_equal 3, scores.count
    assert_equal [@alex.id, @travis.id, @john.id], scores.map(&:profile_id)
    assert_equal [1, 2, 3], scores.map(&:rank)
    assert_equal [25, 28, 30], scores.map(&:result).map(&:to_i)
  end

  test 'returns only best result per profile' do
    create_result(@competition, @john, result: 2000, recorded_at: '2024-03-01')
    create_result(@competition, @john, result: 2500, recorded_at: '2024-03-15')
    create_result(@competition, @john, result: 2200, recorded_at: '2024-03-20')

    scores = VirtualCompetition::AnnualTopScore.for_competition(@competition).for_year(2024)

    assert_equal 1, scores.count
    assert_equal 2500, scores.first.result.to_i
  end

  test 'filters by year' do
    create_result(@competition, @john, result: 2000, recorded_at: '2023-06-01')
    create_result(@competition, @alex, result: 3000, recorded_at: '2024-06-01')
    create_result(@competition, @travis, result: 2500, recorded_at: '2025-06-01')

    scores_2024 = VirtualCompetition::AnnualTopScore.for_competition(@competition).for_year(2024)

    assert_equal 1, scores_2024.count
    assert_equal @alex.id, scores_2024.first.profile_id
  end

  test 'filters by snapshot_at' do
    create_result(@competition, @john, result: 2000, recorded_at: '2024-03-01')
    create_result(@competition, @alex, result: 3000, recorded_at: '2024-03-15')
    create_result(@competition, @travis, result: 4000, recorded_at: '2024-03-20')

    snapshot = Time.zone.parse('2024-03-16')
    scores = VirtualCompetition::AnnualTopScore
      .at_snapshot(snapshot)
      .for_competition(@competition)
      .for_year(2024)

    assert_equal 2, scores.count
    assert_equal [@alex.id, @john.id], scores.map(&:profile_id)
  end

  test 'snapshot_at affects which result is best for profile' do
    create_result(@competition, @john, result: 2000, recorded_at: '2024-03-01')
    create_result(@competition, @john, result: 3000, recorded_at: '2024-03-20')

    early_snapshot = Time.zone.parse('2024-03-10')
    late_snapshot = Time.zone.parse('2024-03-25')

    early_scores = VirtualCompetition::AnnualTopScore
      .at_snapshot(early_snapshot)
      .for_competition(@competition)
      .for_year(2024)
    late_scores = VirtualCompetition::AnnualTopScore
      .at_snapshot(late_snapshot)
      .for_competition(@competition)
      .for_year(2024)

    assert_equal 2000, early_scores.first.result.to_i
    assert_equal 3000, late_scores.first.result.to_i
  end

  test 'only includes non wind_cancelled results' do
    create_result(@competition, @john, result: 2000, recorded_at: '2024-03-01', wind_cancelled: false)
    create_result(@competition, @alex, result: 3000, recorded_at: '2024-03-01', wind_cancelled: true)

    scores = VirtualCompetition::AnnualTopScore.for_competition(@competition).for_year(2024)

    assert_equal 1, scores.count
    assert_equal @john.id, scores.first.profile_id
  end

  test 'returns empty when no results for year' do
    create_result(@competition, @john, result: 2000, recorded_at: '2023-03-01')

    scores = VirtualCompetition::AnnualTopScore.for_competition(@competition).for_year(2024)

    assert_equal 0, scores.count
  end

  test 'returns empty when no results for competition' do
    other_competition = virtual_competitions(:skydive_speed_wingsuit)
    create_result(@competition, @john, result: 2000, recorded_at: '2024-03-01')

    scores = VirtualCompetition::AnnualTopScore.for_competition(other_competition).for_year(2024)

    assert_equal 0, scores.count
  end

  test 'works with includes' do
    create_result(@competition, @john, result: 2000, recorded_at: '2024-03-01')

    scores = VirtualCompetition::AnnualTopScore
      .for_competition(@competition)
      .for_year(2024)
      .includes(:profile)

    assert_nothing_raised { scores.first.profile.name }
  end

  test 'works with limit and offset' do
    create_result(@competition, @john, result: 2000, recorded_at: '2024-03-01')
    create_result(@competition, @alex, result: 3000, recorded_at: '2024-03-02')
    create_result(@competition, @travis, result: 2500, recorded_at: '2024-03-03')

    scores = VirtualCompetition::AnnualTopScore.for_competition(@competition).for_year(2024).limit(2)

    assert_equal 2, scores.size
    assert_equal [1, 2], scores.map(&:rank)
  end

  test 'recorded_at is available on result' do
    recorded = Time.zone.parse('2024-03-15 12:00:00')
    create_result(@competition, @john, result: 2000, recorded_at: recorded)

    score = VirtualCompetition::AnnualTopScore.for_competition(@competition).for_year(2024).first

    assert_equal recorded.to_date, score.recorded_at.to_date
  end

  test 'can query by profile_id' do
    create_result(@competition, @john, result: 2000, recorded_at: '2024-03-01')
    create_result(@competition, @alex, result: 3000, recorded_at: '2024-03-02')

    scores = VirtualCompetition::AnnualTopScore.where(profile_id: @john.id).for_year(2024)

    assert_equal 1, scores.count
    assert_equal @john.id, scores.first.profile_id
  end

  private

  def create_result(competition, profile, result:, recorded_at:, wind_cancelled: false)
    recorded_at = Time.zone.parse(recorded_at) if recorded_at.is_a?(String)
    track = create(:empty_track, pilot: profile, recorded_at:)
    competition.results.create!(track:, result:, wind_cancelled:)
  end
end
