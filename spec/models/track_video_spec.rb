# == Schema Information
#
# Table name: track_videos
#
#  id           :integer          not null, primary key
#  track_id     :integer
#  url          :string(255)
#  video_offset :decimal(10, 2)
#  track_offset :decimal(10, 2)
#  created_at   :datetime
#  updated_at   :datetime
#  video_code   :string(255)
#

require 'rails_helper'

RSpec.describe TrackVideo, type: :model do
  it 'get correct video code from url' do
    video = TrackVideo.create(url: 'https://www.youtube.com/watch?v=CHEVKtmncD4')
    expect(video.video_code).to eq('CHEVKtmncD4')
  end
end
