module PointsProcessor
  POINT_PROCESSOR = {
    flysight: PointsProcessor::Default
  }.with_indifferent_access.freeze

  def self.for(format)
    POINT_PROCESSOR[format] || PointsProcessor::Extended
  end
end
