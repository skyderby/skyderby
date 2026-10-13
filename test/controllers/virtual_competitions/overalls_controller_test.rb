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
    assert_select '.tab-bar--jump-kind .tab-bar-item', 3
    assert_select '.tab-bar--jump-kind .tab-bar-item.active', text: 'All'
  end

  test 'filters scoreboard by selected jump kind' do
    get virtual_competition_overall_path(virtual_competition_id: @competition.id, jump_kind: 'base')

    assert_response :success
    assert_select '.tab-bar .tab-bar-item.active', text: 'BASE'
    assert_select '.vc-scoreboard__row', 1
  end

  test 'private ranking is forbidden for non participants' do
    get virtual_competition_overall_path(virtual_competition_id: virtual_competitions(:feather_challenge).id)

    assert_response :forbidden
  end

  test 'multi-discipline ranking shows every discipline of the counted jump' do
    competition = virtual_competitions(:feather_challenge)
    track = create :empty_track, kind: Track.kinds[:base], pilot: profiles(:regular_user)
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track:, result: 120)
    virtual_competition_disciplines(:feather_challenge_flare).results.create!(track:, result: 15)
    sign_in users(:regular_user)

    get virtual_competition_overall_path(virtual_competition_id: competition.id)

    assert_response :success
    assert_select '.vc-scoreboard__row', 1
    assert_select '.vc-md-header', 1
    assert_select '.vc-scoreboard__row .vc-md-disciplines .vc-md-value' do |values|
      assert_match(/120\s+m/, values[0].text)
      assert_match(/15\.0\s+m/, values[1].text)
    end
    assert_select '.vc-scoreboard__row .vc-md-cell--total .vc-md-value', text: /200\.0/
  end

  private

  def add_score(profile, kind, result)
    track = create :empty_track, kind: Track.kinds[kind], pilot: profile, recorded_at: Time.zone.parse('2016-01-03')
    @competition.results.create!(track: track, result: result)
  end
end
