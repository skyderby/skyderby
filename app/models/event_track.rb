class EventTrack < ActiveRecord::Base
  belongs_to :track
  belongs_to :round
  belongs_to :competitor
end
