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
#

class QualificationJump < ApplicationRecord
  SECONDS_BEFORE_START = 10

  belongs_to :tournament_competitor
  belongs_to :qualification_round
  belongs_to :track

  def start_time
    Time.zone.at(start_time_in_seconds)
  end

  def start_time=(val)
    self.start_time_in_seconds = Time.zone.parse(val).to_f
  end

  def calculate_result
    return unless track
    return if (result || 0).positive?

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
    track.points
         .trimmed(seconds_before_start: SECONDS_BEFORE_START)
         .pluck_to_hash(
           :fl_time,
           'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
           "#{track.point_altitude_field} AS altitude",
           :latitude,
           :longitude
         )
  end
end
