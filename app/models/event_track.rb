class EventTrack < ActiveRecord::Base
  has_one :track
  belongs_to :round
end
