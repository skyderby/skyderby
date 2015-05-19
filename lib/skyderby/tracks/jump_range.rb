module Skyderby
  module Tracks
    class JumpRange 
      attr_accessor :start_point, :end_point

      def initialize(start_pnt, end_pnt)
        @start_point = start_pnt
        @end_point = end_pnt
      end

      def start_time
        @start_point.fl_time
      end

      def end_time
        @end_point.fl_time
      end
    end
  end
end
