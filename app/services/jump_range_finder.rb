module JumpRangeFinder
  JumpRange = Struct.new(:start_point, :end_point, :deploy_point) do
    def start_time
      start_point.fl_time
    end

    def end_time
      end_point.fl_time
    end

    def deploy_time
      deploy_point&.fl_time
    end
  end

  THRESHOLDS = {
    skydive: 25,
    base: 10
  }.with_indifferent_access.freeze

  def self.for(activity)
    Processor.new(threshold_for(activity))
  end

  def self.threshold_for(activity)
    THRESHOLDS[activity]
  end
end
