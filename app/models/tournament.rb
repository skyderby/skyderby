class Tournament < ActiveRecord::Base
  enum discipline: [
    :time,
    :distance,
    :speed,
    :distance_in_time,
    :time_until_intersection
  ]

  belongs_to :place
  has_many :tournament_competitors
  has_many :tournament_rounds
  has_many :tournament_matches, through: :tournament_rounds

  has_many :qualification_rounds
  has_many :qualification_jumps, through: :qualification_rounds
end
