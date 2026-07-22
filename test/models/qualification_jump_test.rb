require 'test_helper'

class QualificationJumpTest < ActiveSupport::TestCase
  setup do
    @jump = qualification_jumps(:qualification_jump_1)
    @tournament = @jump.tournament
  end

  test 'tracks are public for a public tournament' do
    @tournament.update!(visibility: :public_event)

    assert_equal Track.visibilities[:public_track], @jump.tracks_visibility
  end

  test 'tracks are unlisted for a non-public tournament' do
    @tournament.update!(visibility: :private_event)

    assert_equal Track.visibilities[:unlisted_track], @jump.tracks_visibility
  end
end
