module UnitSystem
  UnitSystemData = Struct.new(:distance, :speed, :altitude)

  Metric   = UnitSystemData.new('m',  'kmh', 'm').freeze
  Imperial = UnitSystemData.new('mi', 'mph', 'ft').freeze
end
