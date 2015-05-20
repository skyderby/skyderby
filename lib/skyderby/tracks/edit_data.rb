module Skyderby
  module Tracks
    class EditData < TrackData
      def initialize(track)
        super

        @duration = @points.last[0]
        @ff_start = track.ff_start || 0
        @ff_end = track.ff_end || @duration
      end

      def to_data_attr
        {
          points: @points.to_json.html_safe,
          max_rel_time: @duration,
          range_from: @ff_start,
          range_to: @ff_end,
          suit: ({
            id: @track.wingsuit.id,
            name: @track.wingsuit.name
          } if @track.wingsuit)
        }
      end

      protected

      def init_points
        @points = Skyderby::Tracks::Points.new(@track).points.map do |point|
          [point[:fl_time_abs], point[:elevation]]
        end
      end
    end
  end
end
