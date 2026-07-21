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
  include AcceptsNestedTrack, Tournament::SubmissionResult

  belongs_to :competitor, class_name: 'Tournament::Competitor'
  belongs_to :qualification_round
  belongs_to :track, optional: true

  delegate :tournament, to: :qualification_round
  delegate :name, to: :competitor, prefix: true, allow_nil: true
  delegate :order, to: :round, prefix: true, allow_nil: true
  delegate :suit_id, to: :competitor

  alias round qualification_round
  alias event tournament

  before_save :assign_top_speed, if: -> { track && (track_id_changed? || top_speed.nil?) }

  def start_time
    return unless start_time_in_seconds

    Time.zone.at(start_time_in_seconds)
  end

  def start_time=(val)
    self.start_time_in_seconds = val.blank? ? nil : Time.zone.parse(val.to_s)&.to_f
  rescue ArgumentError
    self.start_time_in_seconds = nil
  end

  # Auto-detected start, matching online competitions: the point where vertical
  # speed first reaches BASE_START_SPEED (10 km/h).
  def detected_start_time
    base_race_start_point&.fetch(:gps_time)
  end

  def track_owner = tournament

  def tracks_visibility = :public_track

  def track_activity = :base

  def track_comment = "#{tournament.name} - Qualification #{qualification_round.order}"

  # Maximum developed full (3D) speed between exit and the finish line, in km/h.
  def calculate_top_speed
    jump_range_points
      &.map { |point| Math.sqrt(point[:h_speed].to_f**2 + point[:v_speed].to_f**2) }
      &.max
  end

  private

  def base_race_start_point
    return unless track

    points = PointsPostprocessor.for(track.gps_type).call(
      PointsQuery.execute(
        track,
        trimmed: { seconds_before_start: 10 },
        only: %i[gps_time time_diff altitude latitude longitude h_speed v_speed glide_ratio]
      )
    )

    WindowRangeFinder
      .new(points)
      .execute(from_vertical_speed: OnlineCompetitionsService::BASE_START_SPEED)
      .start_point
  rescue WindowRangeFinder::ValueOutOfRange
    nil
  end

  def jump_range_points
    return unless track
    return unless start_time && result&.positive?

    finish_time = start_time.to_f + result.to_f

    PointsQuery
      .execute(track, only: %i[gps_time h_speed v_speed])
      .select { |point| point[:gps_time].to_f.between?(start_time.to_f, finish_time) }
  end

  def assign_top_speed
    self.top_speed = calculate_top_speed
  end

  def finish_line
    qualification_round.tournament.finish_line
  end
end
