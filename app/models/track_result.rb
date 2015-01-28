class TrackResult < ActiveRecord::Base
  belongs_to :track
  enum discipline: [:time, :distance, :speed]
end
