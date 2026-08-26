require 'test_helper'

class Places::SubmissionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @place = Place.create!(
      name: 'Pilot added exit',
      country: countries(:norway),
      kind: :base,
      latitude: 61.1,
      longitude: 7.1
    )
    @submission = Place::Submission.create!(place: @place, user: users(:regular_user))
  end

  test '#index lists submissions for a place editor' do
    editor = users(:places_editor)
    Profile.create!(name: 'Places editor', owner: editor)
    sign_in editor

    get places_submissions_path

    assert_response :success
    assert_match @place.name, @response.body
  end

  test '#index is not available for a regular user' do
    sign_in users(:regular_user)

    get places_submissions_path

    assert_response :forbidden
  end

  test '#show renders the review dialog' do
    sign_in users(:admin)

    get places_submission_path(@submission), as: :turbo_stream

    assert_response :success
    assert_match 'modal-root', @response.body
    assert_match @place.name, @response.body
  end
end
