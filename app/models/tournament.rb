# == Schema Information
#
# Table name: tournaments
#
#  id               :integer          not null, primary key
#  name             :string(510)
#  place_id         :integer
#  discipline       :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  finish_start_lat :decimal(15, 10)
#  finish_start_lon :decimal(15, 10)
#  finish_end_lat   :decimal(15, 10)
#  finish_end_lon   :decimal(15, 10)
#  starts_at        :date
#  exit_lat         :decimal(15, 10)
#  exit_lon         :decimal(15, 10)
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
  has_many :competitors, class_name: 'TournamentCompetitor'
  has_many :rounds, class_name: 'TournamentRound'
  has_many :matches, through: :rounds, source: :matches #class_name: 'TournamentMatch'

  has_many :qualification_rounds
  has_many :qualification_jumps, through: :qualification_rounds

  has_many :sponsors, as: :sponsorable

  def finish_line
    [
      Skyderby::Tracks::TrackPoint.new(
        latitude: finish_start_lat,
        longitude: finish_start_lon
      ),
      Skyderby::Tracks::TrackPoint.new(
        latitude: finish_end_lat,
        longitude: finish_end_lon
      )
    ]
  end

end
