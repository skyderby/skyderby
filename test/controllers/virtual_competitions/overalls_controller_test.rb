require 'test_helper'

class VirtualCompetitions::OverallsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @competition = VirtualCompetition.create!(
      name: 'Flare',
      group: virtual_competition_groups(:main),
      discipline: :flare,
      jumps_kind: nil,
      period_from: '2015-01-01',
      period_to: '2027-01-01'
    )

    add_score profiles(:john), :skydive, 100
    add_score profiles(:maynard), :base, 90
  end

  test 'renders jump kind tab-bar for mixed flare competition' do
    get virtual_competition_overall_path(virtual_competition_id: @competition.id)

    assert_response :success
    assert_select '.tab-bar .tab-bar-item', 3
    assert_select '.tab-bar .tab-bar-item.active', text: 'All'
  end

  test 'filters scoreboard by selected jump kind' do
    get virtual_competition_overall_path(virtual_competition_id: @competition.id, jump_kind: 'base')

    assert_response :success
    assert_select '.tab-bar .tab-bar-item.active', text: 'BASE'
    assert_select '.vc-scoreboard__row', 1
  end

  private

  def add_score(profile, kind, result)
    track = create :empty_track, kind: Track.kinds[kind], pilot: profile, recorded_at: Time.zone.parse('2016-01-03')
    @competition.results.create!(track: track, result: result)
  end
end
