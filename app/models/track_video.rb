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

class TrackVideo < ApplicationRecord
  belongs_to :track

  validates :url, presence: true
  validates :video_code, presence: true
  validates :video_offset, presence: true, numericality: true
  validates :track_offset, presence: true, numericality: true

  before_validation :parse_url

  private

  def parse_url
    regexp = %r{^.*(youtu.be/|v/|u/\w/|embed/|watch\?v=|&v=)([^#&?]*).*}
    self.video_code = url.match(regexp)[2]
  end
end
