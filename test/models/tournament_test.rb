require 'test_helper'

class TournamentTest < ActiveSupport::TestCase
  setup do
    @tournament = tournaments(:qualification_loen)
  end

  test 'derives public track visibility from a public tournament' do
    @tournament.update!(visibility: :public_event)

    assert_equal Track.visibilities[:public_track], @tournament.tracks_visibility
  end

  test 'derives unlisted track visibility from a non-public tournament' do
    @tournament.update!(visibility: :unlisted_event)

    assert_equal Track.visibilities[:unlisted_track], @tournament.tracks_visibility
  end

  test 'cascades visibility change to already uploaded tracks' do
    track = tracks(:hellesylt)
    track.update!(owner: @tournament, visibility: :public_track)

    @tournament.update!(visibility: :private_event)

    assert_equal 'unlisted_track', track.reload.visibility
  end
end
