require 'application_system_test_case'

class SuitVideosTest < ApplicationSystemTestCase
  setup do
    sign_in users(:regular_user)
  end

  test 'lists videos of tracks flown in the suit' do
    track = Track.create!(pilot: profiles(:alex), suit: suits(:apache), kind: :base,
                          visibility: :public_track, recorded_at: 1.day.ago)
    TrackVideo.create!(track:, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                       track_offset: 0, video_offset: 0)

    visit suit_path(suits(:apache))
    click_on I18n.t('suits.show.videos')

    assert_selector '.video-thumbnail', count: 1
    assert_selector '.page-tab-active', text: /#{I18n.t('suits.show.videos')}/i
  end

  test 'shows no videos from another suit' do
    track = Track.create!(pilot: profiles(:alex), suit: suits(:nala), kind: :base,
                          visibility: :public_track, recorded_at: 1.day.ago)
    TrackVideo.create!(track:, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                       track_offset: 0, video_offset: 0)

    visit suit_videos_path(suits(:apache))

    assert_no_selector '.video-thumbnail'
  end
end
