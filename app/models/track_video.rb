class TrackVideo < ActiveRecord::Base
  belongs_to :track
  before_validation :parse_url

  validates :url, presence: true
  validates :video_code, presence: true 

  def points
    track_data = TrackPoints.new(track)
    track_data.trimmed(start: track_offset).to_json.html_safe
  end

  def competition_params

  end

  private

  def parse_url
    regexp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    self.video_code = url.match(regexp)[2]
  end
end
