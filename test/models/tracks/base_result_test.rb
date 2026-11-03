require 'test_helper'

class Tracks::BaseResultTest < ActiveSupport::TestCase
  test 'offers listed BASE disciplines for a track without place' do
    track = create(:empty_track, kind: Track.kinds[:base], suit: suits(:apache))

    result = Tracks::BaseResult.new(track)

    assert_predicate result, :available?
    assert_equal [virtual_competitions(:distance_in_time)], result.competitions
  end

  test 'does not offer unscored disciplines for a track with place' do
    track = create(:empty_track, kind: Track.kinds[:base], suit: suits(:apache), place: places(:hellesylt))

    assert_not_predicate Tracks::BaseResult.new(track), :available?
  end

  test 'does not offer wingsuit disciplines for a tracksuit track without place' do
    track = create(:empty_track, kind: Track.kinds[:base], suit: suits(:oneshot))

    assert_not_predicate Tracks::BaseResult.new(track), :available?
  end
end
