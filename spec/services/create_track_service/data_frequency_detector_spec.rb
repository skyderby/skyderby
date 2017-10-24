require 'spec_helper'

describe CreateTrackService::DataFrequencyDetector do
  PointRecord = Struct.new(:fl_time)

  it 'calculates most popular frequency' do
    points = [
      PointRecord.new(1),
      PointRecord.new(1.2),
      PointRecord.new(1.4),
      PointRecord.new(1.6),
      PointRecord.new(7),
      PointRecord.new(9),
      PointRecord.new(10),
      PointRecord.new(11),
      PointRecord.new(14)
    ]

    result = CreateTrackService::DataFrequencyDetector.call(points)
    expect(result).to eq(5)
  end

  it 'returns 1 unless points given' do
    result = CreateTrackService::DataFrequencyDetector.call([])
    expect(result).to eq(1)
  end

  it 'returns 1 if only one point given' do
    points = [PointRecord.new(1)]
    result = CreateTrackService::DataFrequencyDetector.call(points)
    expect(result).to eq(1)
  end
end
