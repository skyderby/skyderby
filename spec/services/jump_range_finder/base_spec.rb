require 'spec_helper'

describe JumpRangeFinder::Base do
  it 'should find correct start and end of the base jump' do
    points = read_points_from_file
    jump_range = JumpRangeFinder.for(:base).new(points).execute

    expect(jump_range.start_time).to be_within(1).of(328)
  end

  it 'should find correct start and end of the base jump' do
    points = read_points_from_file
    jump_range = JumpRangeFinder.for(:base).new(points).execute

    expect(jump_range.end_time).to be_within(1).of(410)
  end

  def read_points_from_file
    points = TrackParser.for(:flysight).new(
      path: Rails.root.join('spec', 'support', 'tracks', 'WBR', '11-05-01_Ratmir.CSV')
    ).parse

    PointsProcessor.for(:flysight).new(points).execute
  end
end
