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
      ranking = @competition.overall_ranking(scores_relation, page: 1)
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

  def scores_relation
    @competition.personal_top_scores.wind_cancellation(false).includes(:track, :profile)
  end

  def overall(jump_kind: nil, gender: nil)
    @competition.overall_ranking(scores_relation, jump_kind:, gender:)
  end

  def add_score(profile, kind, result)
    track = create :empty_track, kind: Track.kinds[kind], pilot: profile, recorded_at: Time.zone.parse('2016-01-03')
    @competition.results.create!(track: track, result: result)
  end
end
