# == Schema Information
#
# Table name: qualification_jumps
#
#  id                       :integer          not null, primary key
#  qualification_round_id   :integer
#  tournament_competitor_id :integer
#  result                   :decimal(10, 3)
#  track_id                 :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  start_time_in_seconds    :decimal(17, 3)
#  canopy_time              :decimal(, )
#

class QualificationJump < ApplicationRecord
  SECONDS_BEFORE_START = 10

  attr_accessor :track_attributes, :track_from

  belongs_to :tournament_competitor
  belongs_to :qualification_round
  belongs_to :track, optional: true

  before_validation :create_track_from_file
  before_save :calculate_result

  alias_attribute :competitor, :tournament_competitor
  alias_attribute :round, :qualification_round

  delegate :tournament, to: :qualification_round
  delegate :start_time, to: :track, prefix: true, allow_nil: true
  delegate :name, to: :competitor, prefix: true, allow_nil: true
  delegate :order, to: :round, prefix: true, allow_nil: true

  def start_time
    return unless start_time_in_seconds
    Time.zone.at(start_time_in_seconds)
  end

  def start_time=(val)
    self.start_time_in_seconds = Time.zone.parse(val).to_f
  end

  def create_track_from_file
    return if track
    return if track_from == 'existing_track'

    unless track_attributes && track_attributes[:file]
      errors.add(:base, :track_file_blank)
      throw(:abort)
    end

    track_file = TrackFile.create(file: track_attributes[:file])

    params = track_attributes.merge(
      owner: tournament,
      track_file_id: track_file.id,
      kind: :base,
      place_id: tournament.place_id,
      profile_id: tournament_competitor.profile_id,
      suit_id: tournament_competitor.suit_id,
      comment: "#{tournament.name} - Qualification #{qualification_round.order}"
    ).except(:file)

    self.track = CreateTrackService.call(params)
  end

  def calculate_result
    return unless track
    return unless start_time
    return if result

    intersection_point = PathIntersectionFinder.new(
      track_points,
      finish_line
    ).execute

    self.result = (intersection_point[:gps_time].to_f - start_time.to_f).round(3)
  end

  def finish_line
    qualification_round.tournament.finish_line
  end

  def track_points
    PointsQuery.execute(
      track,
      trimmed: { seconds_before_start: 20 },
      only: %i[gps_time altitude latitude longitude]
    )
  end
end
