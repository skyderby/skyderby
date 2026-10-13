require 'test_helper'

class VirtualCompetitions::PersonDetailsControllerTest < ActionDispatch::IntegrationTest
  test 'lists jumps of a pilot in a multi-discipline ranking with every discipline' do
    competition = virtual_competitions(:feather_challenge)
    best = create :empty_track, kind: Track.kinds[:base], pilot: profiles(:regular_user)
    other = create :empty_track, kind: Track.kinds[:base], pilot: profiles(:regular_user)
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track: best, result: 120)
    virtual_competition_disciplines(:feather_challenge_flare).results.create!(track: best, result: 15)
    virtual_competition_disciplines(:feather_challenge_distance).results.create!(track: other, result: 60)
    sign_in users(:regular_user)

    get virtual_competition_person_details_path(competition, profile_id: profiles(:regular_user).id), as: :turbo_stream

    assert_response :success
    assert_select '.vc-jumps__row', 2
    assert_select '.vc-jumps__row--best .vc-md-cell--total .vc-md-value', text: /200\.0/
    assert_select '.vc-jumps__row--best .vc-md-disciplines .vc-md-cell', 2
  end

  test 'private ranking details are not shown to non participants' do
    get virtual_competition_person_details_path(virtual_competitions(:feather_challenge),
                                                profile_id: profiles(:regular_user).id), as: :turbo_stream

    assert_select 'turbo-stream[target=toasts]'
    assert_select '.vc-jumps', 0
  end
end
