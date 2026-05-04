require 'test_helper'

class PaymentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = speed_skydiving_competitions(:nationals)
    @event.update!(starts_at: Date.new(2027, 1, 1))
    @organizer = @event.responsible
  end

  test 'show forbids access for events that started before billing date' do
    @event.update!(starts_at: Date.new(2020, 1, 1))
    sign_in @organizer
    get speed_skydiving_competition_payments_path(@event)
    assert_response :forbidden
  end

  test 'show requires authentication' do
    get speed_skydiving_competition_payments_path(@event)
    assert_redirected_to new_user_session_path
  end

  test 'show forbids non-organizer' do
    sign_in users(:regular_user)
    get speed_skydiving_competition_payments_path(@event)
    assert_response :forbidden
  end

  test 'show renders for organizer' do
    sign_in @organizer
    get speed_skydiving_competition_payments_path(@event)
    assert_response :success
  end

  test 'create rejects zero or negative entries' do
    sign_in @organizer
    post speed_skydiving_competition_payments_path(@event), params: { entries: 0 }
    assert_redirected_to speed_skydiving_competition_payments_path(@event)
    follow_redirect!
    assert_match(/greater than zero/i, flash[:alert] || @response.body)
  end
end
