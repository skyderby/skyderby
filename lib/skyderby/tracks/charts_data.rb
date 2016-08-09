module Skyderby
  module Tracks
    class ChartsData < TrackData
      def initialize(track, param_from, param_to)
        @track = track
        @points = []

        init_points

        @param_from = param_from
        @param_to = param_to
      end

      def to_data_attr
        {
          id: @track.id,
          default_weather_date: @track.recorded_at
                                      .beginning_of_hour
                                      .strftime('%Y-%m-%d %H:%M'),
          points: @points.to_json,
          height: {
            max: @max_height,
            min: @min_height
          },
          params: {
            from: @param_from || -1,
            to: @param_to || -1
          }.to_json
        }
      end

      private

      def init_points
        tr_points = Points.new(@track)
        tr_points.reduce_freq!

        @points = tr_points.trimmed
        @min_height = tr_points.min_h
        @max_height = tr_points.max_h
      end
    end
  end
end
