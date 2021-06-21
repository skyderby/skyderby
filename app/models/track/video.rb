class Track::Video < ApplicationRecord
  belongs_to :track

  scope :by_place, ->(place_id) { left_joins(:track).where(tracks: { place_id: place_id }) }

  validates :url, :video_code, presence: true
  validates :video_offset, :track_offset, presence: true, numericality: true

  before_validation :parse_url

  private

  def parse_url
    regexp = %r{^.*(youtu.be/|v/|u/\w/|embed/|watch\?v=|&v=)([^#&?]*).*}
    self.video_code = url.match(regexp)[2]
  end
end
