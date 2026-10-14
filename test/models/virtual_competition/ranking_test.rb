require 'test_helper'

class VirtualCompetition::RankingTest < ActiveSupport::TestCase
  setup do
    @competition = VirtualCompetition.create!(
      name: 'Flare',
      group: virtual_competition_groups(:main),
      discipline: :flare,
      jumps_kind: nil,
      period_from: '2015-01-01'
    )

    add_score profiles(:john), :skydive, 100
    add_score profiles(:travis), :skydive, 80
    add_score profiles(:maynard), :base, 90
    add_score profiles(:hinton), :base, 70
  end

  test 'jump_kind options offered for flare without explicit jumps_kind' do
    assert_equal [nil, 'skydive', 'base'], overall.jump_kind_options
  end

  test 'no jump_kind options when competition has explicit jumps_kind' do
    @competition.update!(jumps_kind: :skydive)
    assert_empty overall.jump_kind_options
  end

  test 'without filter all kinds are ranked together' do
    assert_nil overall.jump_kind
    assert_equal [100, 90, 80, 70], overall.all_scores.map(&:result)
  end

  test 'skydive filter keeps only skydive tracks and re-ranks from 1' do
    ranking = overall(jump_kind: 'skydive')

    assert_equal 'skydive', ranking.jump_kind
    assert_equal [100, 80], ranking.all_scores.map(&:result)
    assert_equal [1, 2], ranking.all_scores.map(&:rank)
  end

  test 'base filter keeps only base tracks and re-ranks from 1' do
    ranking = overall(jump_kind: 'base')

    assert_equal [90, 70], ranking.all_scores.map(&:result)
    assert_equal [1, 2], ranking.all_scores.map(&:rank)
  end

  test 'unsupported jump_kind is ignored' do
    assert_nil overall(jump_kind: 'speed_skydiving').jump_kind
  end

  test 'gender options always offer open and female' do
    assert_equal [nil, 'female'], overall.gender_options
  end

  test 'female filter keeps only female profiles and re-ranks from 1' do
    profiles(:john).update!(gender: :female)
    profiles(:maynard).update!(gender: :female)

    ranking = overall(gender: 'female')

    assert_equal 'female', ranking.gender
    assert_equal [100, 90], ranking.all_scores.map(&:result)
    assert_equal [1, 2], ranking.all_scores.map(&:rank)
  end

  test 'unsupported gender is ignored' do
    assert_nil overall(gender: 'male').gender
  end

  test 'gender and jump_kind filters combine' do
    profiles(:john).update!(gender: :female)
    profiles(:maynard).update!(gender: :female)

    ranking = overall(jump_kind: 'skydive', gender: 'female')

    assert_equal [100], ranking.all_scores.map(&:result)
    assert_equal [1], ranking.all_scores.map(&:rank)
  end

  test 'podium and leader come from the top of the ranking' do
    ranking = overall

    assert_equal [100, 90, 80], ranking.podium.map(&:result)
    assert_equal 100, ranking.leader.result
  end

  test 'no podium with fewer than three scores' do
    assert_empty overall(jump_kind: 'base').podium
  end

  test 'score_for finds a profile outside the current page' do
    with_per_page(2) do
      ranking = @competition.ranking(page: 1)

      assert_equal 70, ranking.score_for(profiles(:hinton).id).result
    end
  end

  test 'annual ranking shows rank changes against the ranking a week ago' do
    travel_to Time.zone.parse('2026-06-15') do
      competition = VirtualCompetition.create!(
        name: 'Annual', group: virtual_competition_groups(:main), discipline: :distance,
        period_from: '2026-01-01', period_to: '2026-12-31'
      )
      add_result competition, profiles(:john), 100, '2026-05-01'
      add_result competition, profiles(:travis), 90, '2026-05-02'
      add_result competition, profiles(:maynard), 120, '2026-06-14'

      ranking = competition.ranking(year: 2026)
      changes = ranking.all_scores.to_h { |score| [score.profile_id, ranking.rank_change_for(score)] }

      assert_predicate ranking, :show_rank_changes?
      assert_equal({ profiles(:maynard).id => nil, profiles(:john).id => -1, profiles(:travis).id => -1 }, changes)
    end
  end

  test 'annual ranking compares rank changes within the same filter' do
    travel_to Time.zone.parse('2026-06-15') do
      profiles(:travis).update!(gender: :female)
      competition = VirtualCompetition.create!(
        name: 'Annual', group: virtual_competition_groups(:main), discipline: :distance,
        period_from: '2026-01-01', period_to: '2026-12-31'
      )
      add_result competition, profiles(:john), 100, '2026-05-01'
      add_result competition, profiles(:travis), 90, '2026-05-02'

      ranking = competition.ranking(year: 2026, gender: 'female')

      assert_equal 0, ranking.rank_change_for(ranking.all_scores.sole)
    end
  end

  test 'no rank changes for past years' do
    assert_not @competition.ranking(year: 2016).show_rank_changes?
  end

  test 'highlight_profile_id normalizes blank and string values' do
    ranking = overall
    ranking.highlight_profile_id = ''
    assert_nil ranking.highlight_profile_id

    ranking = overall
    ranking.highlight_profile_id = profiles(:john).id.to_s
    assert_equal profiles(:john).id, ranking.highlight_profile_id
  end

  test 'page defaults to 1 without an explicit page or highlight' do
    assert_equal 1, overall.page
  end

  test 'page jumps to the page containing the highlighted profile' do
    with_per_page(2) do
      ranking = overall
      ranking.highlight_profile_id = profiles(:hinton).id

      assert_equal 2, ranking.page
      assert_includes ranking.scores.map(&:profile_id), profiles(:hinton).id
    end
  end

  test 'explicit page wins over the highlighted profile' do
    with_per_page(2) do
      ranking = @competition.ranking(page: 1)
      ranking.highlight_profile_id = profiles(:hinton).id

      assert_equal 1, ranking.page
    end
  end

  private

  def with_per_page(size)
    original = VirtualCompetition::Ranking::PER_PAGE
    VirtualCompetition::Ranking.send(:remove_const, :PER_PAGE)
    VirtualCompetition::Ranking.const_set(:PER_PAGE, size)
    yield
  ensure
    VirtualCompetition::Ranking.send(:remove_const, :PER_PAGE)
    VirtualCompetition::Ranking.const_set(:PER_PAGE, original)
  end

  def overall(jump_kind: nil, gender: nil)
    @competition.ranking(jump_kind:, gender:)
  end

  def add_result(competition, profile, result, recorded_at)
    track = Track.create!(
      pilot: profile, kind: :skydive, suit: suits(:apache), recorded_at: Time.zone.parse(recorded_at),
      ground_level: 0, ff_start: 0, ff_end: 10
    )
    competition.results.create!(track:, result:)
  end

  def add_score(profile, kind, result)
    track = create :empty_track, kind: Track.kinds[kind], pilot: profile, recorded_at: Time.zone.parse('2016-01-03')
    @competition.results.create!(track: track, result: result)
  end
end
