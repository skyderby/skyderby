class TrackResult < ActiveRecord::Base
  enum discipline: [:time, :distance, :speed]

  belongs_to :track
end
