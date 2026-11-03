require 'test_helper'

class LogbooksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:regular_user)
    @profile = @user.profile
  end

  test 'a guest is sent to sign in' do
    get logbook_path

    assert_redirected_to new_user_session_path
  end

  test 'shows only the jumps of the current profile' do
    @profile.jumps.create!(kind: :skydive, number: 12, jumped_at: 1.day.ago, place_name: 'My dropzone')
    profiles(:admin).jumps.create!(kind: :skydive, number: 13, jumped_at: 1.day.ago, place_name: 'Foreign dropzone')
    sign_in @user

    get logbook_path(kind: :skydive)

    assert_response :success
    assert_match 'My dropzone', @response.body
    assert_no_match 'Foreign dropzone', @response.body
  end

  test 'a jump of another profile cannot be edited' do
    jump = profiles(:admin).jumps.create!(kind: :skydive, jumped_at: 1.day.ago)
    sign_in @user

    assert_raises(ActiveRecord::RecordNotFound) { get edit_logbook_jump_path(jump) }
  end

  test 'creates a jump from the form' do
    sign_in @user

    assert_difference -> { @profile.jumps.count }, 1 do
      post logbook_jumps_path, params: { jump: { kind: 'base', number: 7, jumped_at: '2026-05-01T10:00' } }
    end

    assert_redirected_to logbook_path(kind: 'base')
  end

  test 'adds selected tracks in date order' do
    track = tracks(:hellesylt)
    sign_in @user

    assert_difference -> { @profile.jumps.count }, 1 do
      post logbook_track_import_path, params: { kind: 'base', track_ids: [track.id] }
    end

    assert_equal track, @profile.jumps.last.track
  end

  test 'a masquerading admin cannot open the logbook' do
    sign_in users(:admin)
    post user_masquerades_path(@user)

    get logbook_path

    assert_response :forbidden
  end

  test 'exports csv' do
    @profile.jumps.create!(kind: :base, number: 3, jumped_at: 1.day.ago, notes: 'Calm morning')
    sign_in @user

    get logbook_export_path(format: :csv)

    assert_response :success
    assert_match 'Calm morning', @response.body
  end

  test 'the BASE form offers the four object types and can clear one' do
    jump = @profile.jumps.create!(kind: :base, jumped_at: 1.day.ago, object_type: :span)
    sign_in users(:regular_user)

    get new_logbook_jump_path(kind: :base)
    assert_select '.logbook-choice input[name="jump[object_type]"]', count: 4
    assert_select '.wind-target__cell', count: 13
    assert_select '.logbook-choice__mark', text: 'B'

    patch logbook_jump_path(jump), params: { jump: { object_type: '' } }
    assert_nil jump.reload.object_type
  end

  test 'stores the wind of a BASE jump' do
    sign_in @user

    post logbook_jumps_path, params: {
      jump: { kind: 'base', jumped_at: '2026-05-01T10:00', wind_strength: 'medium', wind_direction: 'left' }
    }

    jump = @profile.jumps.last
    assert_predicate jump, :wind_medium?
    assert_predicate jump, :wind_from_left?
  end

  test 'the new entry repeats the last equipment of the same kind' do
    @profile.jumps.create!(kind: :skydive, jumped_at: 3.days.ago, equipment: 'Sabre 170')
    @profile.jumps.create!(kind: :skydive, jumped_at: 2.days.ago)
    @profile.jumps.create!(kind: :base, jumped_at: 1.day.ago, equipment: 'Hybrid 240')
    sign_in @user

    get new_logbook_jump_path(kind: :skydive)

    assert_select 'input[name="jump[equipment]"][value="Sabre 170"]'
  end

  test 'a user without a profile is sent back from the logbook' do
    sign_in users(:places_editor)

    get logbook_path

    assert_redirected_to root_path
  end

  test 'adding a track from its page reuses the jump it already has' do
    track = tracks(:hellesylt)
    sign_in @user

    post track_logbook_entry_path(track)
    jump = track.reload.jump
    jump.update!(jumped_at: jump.jumped_at - 1.hour)

    assert_no_difference -> { @profile.jumps.count } do
      post track_logbook_entry_path(track)
    end
    assert_redirected_to edit_logbook_jump_path(jump)
  end

  test 'a track of another pilot cannot be added' do
    sign_in users(:admin)

    assert_no_difference -> { Jump.count } do
      post track_logbook_entry_path(tracks(:hellesylt))
    end
    assert_response :forbidden
  end
end
