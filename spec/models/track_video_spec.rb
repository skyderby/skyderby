# == Schema Information
#
# Table name: track_videos
#
#  id           :integer          not null, primary key
#  track_id     :integer
#  url          :string(510)
#  video_offset :decimal(10, 2)
#  track_offset :decimal(10, 2)
#  created_at   :datetime
#  updated_at   :datetime
#  video_code   :string(510)
#

describe Track::Video, type: :model do
  it 'get correct video code from url' do
    video = Track::Video.create(url: 'https://www.youtube.com/watch?v=CHEVKtmncD4')
    expect(video.video_code).to eq('CHEVKtmncD4')
  end

  it 'requires video_offset' do
    video = Track::Video.new(correct_attributes.merge(video_offset: nil))
    expect(video).not_to be_valid
  end

  it 'video_offset should be numeric' do
    video = Track::Video.new(correct_attributes.merge(video_offset: 'aaa'))
    expect(video).not_to be_valid
  end

  it 'requires track_offset' do
    video = Track::Video.new(correct_attributes.merge(track_offset: nil))
    expect(video).not_to be_valid
  end

  it 'track_offset should be numeric' do
    video = Track::Video.new(correct_attributes.merge(track_offset: 'aaa'))
    expect(video).not_to be_valid
  end

  def correct_attributes
    {
      url: 'https://www.youtube.com/watch?v=CHEVKtmncD4',
      video_offset: 14,
      track_offset: 10
    }
  end
end
