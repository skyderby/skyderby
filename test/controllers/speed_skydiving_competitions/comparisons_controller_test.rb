require 'test_helper'

class SpeedSkydivingCompetitions::ComparisonsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @admin = users(:admin)
    @event = speed_skydiving_competitions(:nationals)
    round = speed_skydiving_competition_rounds(:nationals_round_2)

    @track_a = create(:empty_track, :with_point, kind: Track.kinds[:speed_skydiving], visibility: :public_track)
    @track_b = create(:empty_track, :with_point, kind: Track.kinds[:speed_skydiving], visibility: :public_track)

    @event.results.create!(
      competitor: speed_skydiving_competition_competitors(:hinton), round:, track: @track_a, result: 400
    )
    @event.results.create!(
      competitor: speed_skydiving_competition_competitors(:maynard), round:, track: @track_b, result: 410
    )
  end

  test 'grants free pro view for first track and redirects to compare pro view' do
    sign_in @user

    assert_difference -> { FreeProView.where(user: @user, track: @track_a).count }, 1 do
      post speed_skydiving_competition_comparison_path(@event),
           params: { track_a_id: @track_a.id, track_b_id: @track_b.id }
    end

    assert_redirected_to track_path(@track_a, compare_id: @track_b.id)
  end

  test 'subscriber does not consume a free pro view' do
    sign_in @admin

    assert_no_difference -> { FreeProView.count } do
      post speed_skydiving_competition_comparison_path(@event),
           params: { track_a_id: @track_a.id, track_b_id: @track_b.id }
    end

    assert_redirected_to track_path(@track_a, compare_id: @track_b.id)
  end

  test 'redirects to subscriptions when free limit is reached' do
    sign_in @user
    FreeProView.monthly_limit.times do
      FreeProView.create!(user: @user, track: create(:empty_track, :with_point, kind: Track.kinds[:speed_skydiving]))
    end

    assert_no_difference -> { FreeProView.where(track: @track_a).count } do
      post speed_skydiving_competition_comparison_path(@event),
           params: { track_a_id: @track_a.id, track_b_id: @track_b.id }
    end

    assert_redirected_to subscriptions_path
  end

  test 'rejects comparison with a track outside the event' do
    sign_in @user
    other_track = create(:empty_track, :with_point, kind: Track.kinds[:speed_skydiving], visibility: :public_track)

    post speed_skydiving_competition_comparison_path(@event),
         params: { track_a_id: @track_a.id, track_b_id: other_track.id }

    assert_response :unprocessable_content
  end
end
