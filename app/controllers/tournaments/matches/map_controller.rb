class Tournaments::Matches::MapController < ApplicationController
  before_action :set_match
  load_resource :tournament

  SECONDS_BEFORE_START = 10

  def index
    @map_data = { competitors: {} }
    @match.tournament_match_competitors.each do |competitor_result|
      track = competitor_result.track
      points = 
        Point.where(tracksegment_id: track.tracksegments.pluck(:id))
             .where('round(gps_time_in_seconds) = gps_time_in_seconds')
             .where('fl_time BETWEEN :ff_start AND :ff_end', 
                    ff_start: track.ff_start - SECONDS_BEFORE_START, ff_end: track.ff_end)
             .order(:gps_time_in_seconds)
             .pluck_to_hash('to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
                            :elevation,
                            :abs_altitude,
                            :latitude,
                            :longitude)

      has_abs_altitude = track.ge_enabled
      msl_offset =
        if track.ground_level && track.ground_level > 0
          track.ground_level
        elsif track.place_msl
          track.place_msl
        else
          points.map { |x| x[:abs_altitude] }.min
        end

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

    @map_data[:finish_line] = @match.tournament.finish_line
    @map_data[:exit_point] = {
      latitude: @match.tournament.exit_lat,
      longitude: @match.tournament.exit_lon
    }

    render json: @map_data
  end

  private

  def set_match
    @match = TournamentMatch.find(params[:match_id])
  end
end
