class Round < ActiveRecord::Base
  belongs_to :event
  has_many :event_tracks
  belongs_to :discipline
end
