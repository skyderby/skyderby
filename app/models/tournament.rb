# == Schema Information
#
# Table name: tournaments
#
#  id               :integer          not null, primary key
#  name             :string(255)
#  place_id         :integer
#  discipline       :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  finish_start_lat :decimal(15, 10)
#  finish_start_lon :decimal(15, 10)
#  finish_end_lat   :decimal(15, 10)
#  finish_end_lon   :decimal(15, 10)
#  starts_at        :date
#

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
