require 'test_helper'

class Boogie::ResultTest < ActiveSupport::TestCase
  setup do
    @result = Boogie::Result.find(event_results(:boogie_john_1).id)
    @result.round.update_column(:completed_at, nil)
  end

  test 'tracks of a public event are public even when the round is not completed' do
    @result.event.update_column(:visibility, Boogie.visibilities[:public_event])

    assert_equal Track.visibilities[:public_track], @result.tracks_visibility
  end

  test 'tracks of a private event are unlisted' do
    @result.event.update_column(:visibility, Boogie.visibilities[:private_event])

    assert_equal Track.visibilities[:unlisted_track], @result.tracks_visibility
  end
end
