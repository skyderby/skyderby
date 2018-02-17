# == Schema Information
#
# Table name: tournaments
#
#  id                :integer          not null, primary key
#  name              :string(510)
#  place_id          :integer
#  discipline        :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  finish_start_lat  :decimal(15, 10)
#  finish_start_lon  :decimal(15, 10)
#  finish_end_lat    :decimal(15, 10)
#  finish_end_lon    :decimal(15, 10)
#  starts_at         :date
#  exit_lat          :decimal(15, 10)
#  exit_lon          :decimal(15, 10)
#  profile_id        :integer
#  bracket_size      :integer
#  has_qualification :boolean
#

class Tournament < ApplicationRecord
  enum discipline: [
    :time,
    :distance,
    :speed,
    :distance_in_time,
    :time_until_intersection
  ]

  belongs_to :responsible, class_name: 'User'

  belongs_to :place

  has_many :competitors, class_name: 'TournamentCompetitor'
  has_many :rounds, class_name: 'TournamentRound'
  has_many :matches, through: :rounds, source: :matches

  has_many :qualification_rounds
  has_many :qualification_jumps, through: :qualification_rounds

  has_many :sponsors, -> { order(:created_at) }, as: :sponsorable

  delegate :name, to: :place, prefix: true, allow_nil: true

  def finish_line
    [
      Coordinate.new(
        latitude: finish_start_lat,
        longitude: finish_start_lon
      ),
      Coordinate.new(
        latitude: finish_end_lat,
        longitude: finish_end_lon
      )
    ]
  end

  def with_qualification?
    has_qualification
  end

  # For compatibility with Event
  def finished?
    false
  end
end
