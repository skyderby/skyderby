class Events::Rounds::MapController < ApplicationController
  before_action :set_round

  load_resource :event

  def index
    tracks = {}

    @round.event_tracks.each do |event_track|
      track = Track.find(event_track.track_id)
      points =
        Point.where(tracksegment_id: track.tracksegments.pluck(:id))
               .where('round(gps_time_in_seconds) = gps_time_in_seconds')
               .where('fl_time BETWEEN :ff_start AND :ff_end', 
                      ff_start: track.ff_start, ff_end: track.ff_end)
               .where('abs_altitude > 1200')
               .order(:gps_time_in_seconds)
               .pluck_to_hash('(to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\') gps_time',
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

      tracks[event_track.competitor_id] = { points: points }
    end

    render json: tracks
  end

  def set_round
    @round = Round.find(params[:round_id])
  end
end
