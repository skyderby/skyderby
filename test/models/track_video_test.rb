require 'test_helper'

class TrackVideoTest < ActiveSupport::TestCase
  test 'get correct video code from url' do
    video = TrackVideo.create(url: 'https://www.youtube.com/watch?v=CHEVKtmncD4', video_offset: 14, track_offset: 10)
    assert_equal 'CHEVKtmncD4', video.video_code
  end

  test 'parse standard YouTube URL' do
    video = build_video_with_url('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    assert_equal 'dQw4w9WgXcQ', video.video_code
  end

  test 'parse YouTube URL with additional parameters' do
    video = build_video_with_url('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')
    assert_equal 'dQw4w9WgXcQ', video.video_code
  end

  test 'parse shortened youtu.be URL' do
    video = build_video_with_url('https://youtu.be/dQw4w9WgXcQ')
    assert_equal 'dQw4w9WgXcQ', video.video_code
  end

  test 'parse youtu.be URL with parameters' do
    video = build_video_with_url('https://youtu.be/dQw4w9WgXcQ?t=42')
    assert_equal 'dQw4w9WgXcQ', video.video_code
  end

  test 'parse embed URL' do
    video = build_video_with_url('https://www.youtube.com/embed/dQw4w9WgXcQ')
    assert_equal 'dQw4w9WgXcQ', video.video_code
  end

  test 'parse /v/ URL format' do
    video = build_video_with_url('https://www.youtube.com/v/dQw4w9WgXcQ')
    assert_equal 'dQw4w9WgXcQ', video.video_code
  end

  test 'parse mobile YouTube URL' do
    video = build_video_with_url('https://m.youtube.com/watch?v=dQw4w9WgXcQ')
    assert_equal 'dQw4w9WgXcQ', video.video_code
  end

  test 'parse YouTube Shorts URL' do
    video = build_video_with_url('https://youtube.com/shorts/OAb9gaGq_rM?si=lt74jbJY7cpaamX8')
    assert_equal 'OAb9gaGq_rM', video.video_code
  end

  test 'parse youtu.be URL with si parameter' do
    video = build_video_with_url('https://youtu.be/GAsVaWWAArA?si=yGqEbVdDBWwYapvZ')
    assert_equal 'GAsVaWWAArA', video.video_code
  end

  test 'parse video code with underscore and hyphen' do
    video = build_video_with_url('https://www.youtube.com/watch?v=abc_123-xyz')
    assert_equal 'abc_123-xyz', video.video_code
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

  private

  def build_video_with_url(url)
    TrackVideo.new(
      track: tracks(:hellesylt),
      url: url,
      video_offset: 14,
      track_offset: 10
    ).tap(&:valid?) # triggers before_validation callback
  end
end
