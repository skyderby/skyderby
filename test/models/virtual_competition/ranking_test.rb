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

  private

  def overall(jump_kind: nil)
    scores = @competition.personal_top_scores.wind_cancellation(false).includes(:track)
    @competition.overall_ranking(scores, jump_kind:)
  end

  def add_score(profile, kind, result)
    track = create :empty_track, kind: Track.kinds[kind], pilot: profile, recorded_at: Time.zone.parse('2016-01-03')
    @competition.results.create!(track: track, result: result)
  end
end
