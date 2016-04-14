# == Schema Information
#
# Table name: tournament_match_competitors
#
#  id                       :integer          not null, primary key
#  result                   :decimal(10, 3)
#  tournament_competitor_id :integer
#  tournament_match_id      :integer
#  track_id                 :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  is_winner                :boolean
#  is_disqualified          :boolean
#  is_lucky_looser          :boolean
#  notes                    :string(255)
#  earn_medal               :integer
#

class TournamentMatchCompetitor < ActiveRecord::Base

  SECONDS_BEFORE_START = 10

  enum earn_medal: [:gold, :silver, :bronze]

  belongs_to :tournament_competitor
  belongs_to :tournament_match
  belongs_to :track

  before_save :calculate_result

  delegate :start_time, to: :tournament_match

  def calculate_result
    return unless track
    return if (result || 0) > 0

    track_points = Skyderby::Tracks::Points.new(track)
    self.result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
      track_points, start_time: start_time, finish_line: tournament_match.tournament.finish_line
    ).calculate
  end

  def track_points
    Point.for_track(track_id)
         .freq_1Hz
         .trimmed(seconds_before_start: SECONDS_BEFORE_START)
         .pluck_to_hash(
           'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
           track.point_altitude_field,
           :latitude,
           :longitude)
  end
end
