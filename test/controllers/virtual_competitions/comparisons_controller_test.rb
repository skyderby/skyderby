require 'test_helper'

class VirtualCompetitions::ComparisonsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @admin = users(:admin)

    @competition = VirtualCompetition.create!(
      name: 'Race',
      group: virtual_competition_groups(:main),
      discipline: :base_race,
      jumps_kind: :base,
      period_from: '2015-01-01',
      period_to: '2027-01-01'
    )

    @track_a = create(:empty_track, :with_point, kind: Track.kinds[:base])
    @track_b = create(:empty_track, :with_point, kind: Track.kinds[:base])
    @competition.results.create!(track: @track_a, result: 30)
    @competition.results.create!(track: @track_b, result: 32)
  end

  test 'grants free pro view for first track and redirects to compare pro view' do
    sign_in @user

    assert_difference -> { FreeProView.where(user: @user, track: @track_a).count }, 1 do
      post virtual_competition_comparison_path(@competition),
           params: { track_a_id: @track_a.id, track_b_id: @track_b.id, result_competition_id: @competition.id }
    end

    assert_redirected_to track_path(@track_a, compare_id: @track_b.id, result_competition_id: @competition.id)
  end

  test 'subscriber does not consume a free pro view' do
    sign_in @admin

    assert_no_difference -> { FreeProView.count } do
      post virtual_competition_comparison_path(@competition),
           params: { track_a_id: @track_a.id, track_b_id: @track_b.id }
    end

    assert_redirected_to track_path(@track_a, compare_id: @track_b.id, result_competition_id: @competition.id)
  end

  test 'redirects to subscriptions when free limit is reached' do
    sign_in @user
    FreeProView.monthly_limit.times do
      FreeProView.create!(user: @user, track: create(:empty_track, :with_point, kind: Track.kinds[:base]))
    end

    assert_no_difference -> { FreeProView.where(track: @track_a).count } do
      post virtual_competition_comparison_path(@competition),
           params: { track_a_id: @track_a.id, track_b_id: @track_b.id }
    end

    assert_redirected_to subscriptions_path
  end

  test 'allows comparison of speed skydiving tracks' do
    sign_in @user
    competition = VirtualCompetition.create!(
      name: 'Speed',
      group: virtual_competition_groups(:main),
      discipline: :speed,
      jumps_kind: :speed_skydiving,
      period_from: '2015-01-01',
      period_to: '2027-01-01'
    )
    track_a = create(:empty_track, :with_point, kind: Track.kinds[:speed_skydiving])
    track_b = create(:empty_track, :with_point, kind: Track.kinds[:speed_skydiving])
    competition.results.create!(track: track_a, result: 400)
    competition.results.create!(track: track_b, result: 410)

    post virtual_competition_comparison_path(competition),
         params: { track_a_id: track_a.id, track_b_id: track_b.id }

    assert_redirected_to track_path(track_a, compare_id: track_b.id, result_competition_id: competition.id)
  end

  test 'rejects comparison of tracks with different kinds' do
    sign_in @user
    skydive_track = create(:empty_track, :with_point, kind: Track.kinds[:skydive])

    post virtual_competition_comparison_path(@competition),
         params: { track_a_id: @track_a.id, track_b_id: skydive_track.id }

    assert_response :unprocessable_content
  end
end
