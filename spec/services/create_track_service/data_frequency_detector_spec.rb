require 'spec_helper'

describe CreateTrackService::DataFrequencyDetector do
  point_mock = Struct.new(:fl_time)

  it 'calculates most popular frequency' do
    points = [1, 1.2, 1.4, 1.6, 7, 9, 10, 11, 14].map do |fl_time|
      point_mock.new(fl_time)
    end

    result = CreateTrackService::DataFrequencyDetector.call(points)
    expect(result).to eq(5)
  end

  it 'returns 1 unless points given' do
    result = CreateTrackService::DataFrequencyDetector.call([])
    expect(result).to eq(1)
  end

  it 'returns 1 if only one point given' do
    points = [point_mock.new(1)]
    result = CreateTrackService::DataFrequencyDetector.call(points)
    expect(result).to eq(1)
  end
end
