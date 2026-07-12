require 'test_helper'

class PerformanceCompetitions::ComparisonsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @organizer = create(:user)
    @user = create(:user)
    @admin = users(:admin)

    @competition = create(:event, responsible: @organizer)
    round = create(:event_round, event: @competition)

    @public_a = create(:empty_track, :with_point, kind: Track.kinds[:skydive], visibility: :public_track)
    @public_b = create(:empty_track, :with_point, kind: Track.kinds[:skydive], visibility: :public_track)
    @private_track = create(:empty_track, :with_point, kind: Track.kinds[:skydive], visibility: :private_track)

    [@public_a, @public_b, @private_track].each do |track|
      create(:event_result, round: round, track: track)
    end
  end

  test 'grants free pro view for first track and redirects to compare pro view' do
    sign_in @user

    assert_difference -> { FreeProView.where(user: @user, track: @public_a).count }, 1 do
      post performance_competition_comparison_path(@competition),
           params: { track_a_id: @public_a.id, track_b_id: @public_b.id }
    end

    assert_redirected_to track_path(@public_a, compare_id: @public_b.id)
  end

  test 'subscriber does not consume a free pro view' do
    sign_in @admin

    assert_no_difference -> { FreeProView.count } do
      post performance_competition_comparison_path(@competition),
           params: { track_a_id: @public_a.id, track_b_id: @public_b.id }
    end

    assert_redirected_to track_path(@public_a, compare_id: @public_b.id)
  end

  test 'redirects to subscriptions when free limit is reached' do
    sign_in @user
    FreeProView.monthly_limit.times do
      FreeProView.create!(user: @user, track: create(:empty_track, :with_point, kind: Track.kinds[:skydive]))
    end

    assert_no_difference -> { FreeProView.where(track: @public_a).count } do
      post performance_competition_comparison_path(@competition),
           params: { track_a_id: @public_a.id, track_b_id: @public_b.id }
    end

    assert_redirected_to subscriptions_path
  end

  test 'non-organizer cannot compare a private (incomplete round) track' do
    sign_in @user

    post performance_competition_comparison_path(@competition),
         params: { track_a_id: @public_a.id, track_b_id: @private_track.id }

    assert_response :unprocessable_content
  end

  test 'organizer can compare a private (incomplete round) track' do
    sign_in @organizer

    assert_difference -> { FreeProView.where(user: @organizer, track: @private_track).count }, 1 do
      post performance_competition_comparison_path(@competition),
           params: { track_a_id: @private_track.id, track_b_id: @public_a.id }
    end

    assert_redirected_to track_path(@private_track, compare_id: @public_a.id)
  end
end
