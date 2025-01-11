require 'test_helper'

class TrackVideoTest < ActiveSupport::TestCase
  test 'get correct video code from url' do
    video = TrackVideo.create(url: 'https://www.youtube.com/watch?v=CHEVKtmncD4', video_offset: 14, track_offset: 10)
    assert_equal 'CHEVKtmncD4', video.video_code
  end

  test 'validations' do
    correct_attributes = {
      track: tracks(:hellesylt),
      url: 'https://www.youtube.com/watch?v=CHEVKtmncD4',
      video_offset: 14,
      track_offset: 10
    }

    assert_predicate TrackVideo.new(correct_attributes), :valid?
    assert_not_predicate TrackVideo.new(correct_attributes.merge(video_offset: nil)), :valid?
    assert_not_predicate TrackVideo.new(correct_attributes.merge(video_offset: 'aaa')), :valid?
    assert_not_predicate TrackVideo.new(correct_attributes.merge(track_offset: nil)), :valid?
    assert_not_predicate TrackVideo.new(correct_attributes.merge(track_offset: 'aaa')), :valid?
  end
end
