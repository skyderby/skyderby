require 'test_helper'

class VirtualCompetition::MultiDisciplineStandingsTest < ActiveSupport::TestCase
  setup do
    @competition = virtual_competitions(:feather_challenge)
  end

  test 'scores every discipline of a single track relative to the best results' do
    add_jump profiles(:john), distance: 100, flare: 10
    add_jump profiles(:maynard), distance: 40, flare: 20

    scores = @competition.multi_discipline_standings.overall

    assert_equal [profiles(:john), profiles(:maynard)], scores.map(&:profile)
    assert_equal [1, 2], scores.map(&:rank)
    assert_in_delta 150, scores.first.result
    assert_equal [100, 50], scores.first.entries.map(&:points)
    assert_equal [0, -10], scores.first.entries.map(&:gap)
    assert_in_delta 140, scores.second.result
  end

  test 'counts the best single track instead of combining results from different tracks' do
    best = add_jump profiles(:john), distance: 90, flare: 18
    add_jump profiles(:john), distance: 100, flare: nil
    add_jump profiles(:john), distance: nil, flare: 20

    score = @competition.multi_discipline_standings.overall.sole

    assert_equal best, score.track
    assert_in_delta 180, score.result
  end

  test 'limits scores to the requested year' do
    add_jump profiles(:john), distance: 100, flare: 10, recorded_at: Time.zone.parse('2024-06-01')
    add_jump profiles(:maynard), distance: 50, flare: 20, recorded_at: Time.zone.parse('2025-06-01')

    scores = @competition.multi_discipline_standings.for_year(2025)

    assert_equal [profiles(:maynard)], scores.map(&:profile)
    assert_in_delta 200, scores.first.result
  end

  test 'requires at least two disciplines' do
    competition = VirtualCompetition.new(
      name: 'Single', group: virtual_competition_groups(:main), discipline: :flare,
      disciplines_attributes: [{ discipline: :flare }]
    )

    assert_not competition.valid?
    assert competition.errors.added?(:disciplines, :single)
  end

  private

  def add_jump(profile, distance:, flare:, recorded_at: Time.zone.parse('2025-03-01'))
    track = create :empty_track, kind: Track.kinds[:base], pilot: profile, recorded_at: recorded_at
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track:, result: distance) if distance
    virtual_competition_disciplines(:feather_challenge_flare).results.create!(track:, result: flare) if flare
    track
  end
end
