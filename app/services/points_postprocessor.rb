module PointsPostprocessor
  POSTPROCESSOR = {
    flysight: NullPostprocessor,
    cybereye: NullPostprocessor
  }.with_indifferent_access.freeze

  def self.for(format)
    POSTPROCESSOR[format] || Default
  end
end
