require 'spec_helper'

describe JumpRangeFinder do
  it 'should find correct start and end of the base jump' do
    points = read_points_from file: 'WBR/11-05-01_Ratmir.CSV'

    jump_range = JumpRangeFinder.for(:base).call(points)

    expect(jump_range.start_time).to be_within(1).of(328)
    expect(jump_range.end_time).to be_within(1).of(410)
  end

  it 'should find correct start of skydive jump' do
    points = read_points_from file: '2014-Csaba-Round-1.CSV'

    jump_range = JumpRangeFinder.for(:skydive).call(points)

    expect(jump_range.start_time).to be_within(1).of(461)
    expect(jump_range.end_time).to be_within(1).of(685)
    expect(jump_range.deploy_time).to be_within(1).of(568)
  end

  it 'should work without exceptions on broken data' do
    points = [TrackParser::PointRecord.new(nil)]

    jump_range = JumpRangeFinder.for(:base).call(points)

    expect(jump_range.end_time).to eq(0)
  end

  def read_points_from(file: )
    points = TrackParser.for(:flysight).new(
      path: Rails.root.join('spec', 'support', 'tracks', file)
    ).parse

    PointsProcessor.for(:flysight).new(points).execute
  end
end
