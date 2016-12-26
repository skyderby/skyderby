module JumpRangeFinder
  JumpRange = Struct.new(:start_point, :end_point) do
    def start_time
      start_point.fl_time
    end

    def end_time
      end_point.fl_time
    end
  end

  def self.for(activity)
    JumpRangeFinder.const_get(activity.to_s.classify)
  end
end
