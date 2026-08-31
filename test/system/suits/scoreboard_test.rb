require 'application_system_test_case'

class SuitScoreboardTest < ApplicationSystemTestCase
  setup do
    sign_in users(:regular_user)
    @group = VirtualCompetition::Group.create!(name: VirtualCompetition::Group::SKYDIVE_COMBINED)
    @competitions = build_competitions
  end

  test 'lists the combined standings for tracks in this suit' do
    score(profiles(:alex), suits(:apache), distance: 3000, speed: 300, time: 90)
    score(profiles(:john), suits(:apache), distance: 2000, speed: 200, time: 60)
    score(profiles(:travis), suits(:nala), distance: 4000, speed: 400, time: 120)

    visit suit_path(suits(:apache), query: { kind: :skydive })

    assert_selector '.scoreboard-competitor', count: 2
    assert_text profiles(:alex).name.titleize
    assert_no_text profiles(:travis).name.titleize
  end

  test 'switches between raw and wind adjusted results' do
    score(profiles(:alex), suits(:apache), distance: 3000, speed: 300, time: 90)
    score(profiles(:john), suits(:apache), distance: 2000, speed: 200, time: 60)
    score(profiles(:travis), suits(:apache), distance: 5000, speed: 500, time: 150,
                                             wind_cancelled: true)

    visit suit_path(suits(:apache), query: { kind: :skydive })
    assert_selector '.scoreboard-competitor', count: 2

    click_on I18n.t('virtual_competitions.groups.actions_bar.wind_cancelled')

    assert_selector '.scoreboard-competitor', count: 1
    assert_text profiles(:travis).name.titleize
  end

  test 'loads more pilots beyond the first ten' do
    12.times do |index|
      profile = Profile.create!(name: "Pilot #{index}")
      score(profile, suits(:apache), distance: 1000 + index, speed: 100 + index, time: 60 + index)
    end

    visit suit_path(suits(:apache), query: { kind: :skydive })
    assert_selector '.scoreboard-competitor', count: 10

    click_on I18n.t('virtual_competitions.groups.load_more.load_more')

    assert_selector '.scoreboard-competitor', count: 12
  end

  private

  def build_competitions
    { distance: 'descending', speed: 'descending', time: 'ascending' }.to_h do |discipline, order|
      competition = VirtualCompetition.create!(
        name: "Wingsuit #{discipline}", group: @group, suits_kind: :wingsuit, jumps_kind: :skydive,
        discipline:, results_sort_order: order, period_from: '2015-01-01', period_to: '2030-01-01'
      )
      [discipline, competition]
    end
  end

  def score(profile, suit, wind_cancelled: false, **results)
    track = Track.create!(pilot: profile, suit:, kind: :skydive, visibility: :public_track,
                          recorded_at: 1.day.ago)

    results.each do |discipline, result|
      VirtualCompetition::Result.create!(virtual_competition: @competitions[discipline], track:,
                                         result:, wind_cancelled:)
    end
  end
end
