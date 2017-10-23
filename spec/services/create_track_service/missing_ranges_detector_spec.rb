require 'spec_helper'

describe CreateTrackService::MissingRangesDetector do
  PointRecord = Struct.new(:fl_time)

  it 'detect missing ranges in data' do
    points = [
      PointRecord.new(1),
      PointRecord.new(1.2),
      PointRecord.new(1.4),
      PointRecord.new(1.6),
      PointRecord.new(7),
      PointRecord.new(9),
      PointRecord.new(10),
      PointRecord.new(11),
      PointRecord.new(14),
      PointRecord.new(14.2),
      PointRecord.new(14.4),
      PointRecord.new(14.6)
    ]

    result = CreateTrackService::MissingRangesDetector.call(points, 5)
    expect(result).to eq([{ start: 1.6, end: 14 }])
  end

  it 'returns blank array unless points given' do
    result = CreateTrackService::MissingRangesDetector.call([], 5)
    expect(result).to eq([])
  end
end
