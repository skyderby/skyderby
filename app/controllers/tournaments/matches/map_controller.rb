class Tournaments::Matches::MapController < ApplicationController
  before_action :set_match
  load_resource :tournament

  SECONDS_BEFORE_START = 10

  def index
    @map_data = { competitors: {} }
    @match.tournament_match_competitors.each do |competitor_result|
      track = competitor_result.track
      points = Point.for_track(competitor_result.track_id)
                    .freq_1Hz
                    .trimmed(seconds_before_start: SECONDS_BEFORE_START)
                    .pluck_to_hash(
                      'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
                      :elevation,
                      :abs_altitude,
                      :latitude,
                      :longitude)

      has_abs_altitude = track.ge_enabled
      msl_offset       = track.msl_offset

      points = points.map do |x|
        {
          gps_time: x[:gps_time],
          latitude: x[:latitude],
          longitude: x[:longitude],
          altitude: has_abs_altitude ? x[:abs_altitude] - msl_offset : x[:elevation]
        }
      end

      @map_data[:competitors][competitor_result.id] = { 
        track_points: points,
        name: competitor_result.tournament_competitor.user_profile.name
      }
    end

    @map_data[:finish_line] = @tournament.finish_line
    @map_data[:exit_point] = {
      latitude: @tournament.exit_lat,
      longitude: @tournament.exit_lon
    }

    render json: @map_data
  end

  private

  def set_match
    @match = TournamentMatch.find(params[:match_id])
  end
end
