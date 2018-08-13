require 'spec_helper'

describe SegmentParser::GPX do
  it 'should return segments' do
    file_path = Rails.root.join('spec', 'support', 'tracks', 'two_tracks.gpx')
    parser = SegmentParser.for(:gpx).new(path: file_path)

    expect(parser.segments.count).to eq 3
  end

  it 'should parse segment name, point count, gain altitude, loose altitude' do
    file_path = Rails.root.join('spec', 'support', 'tracks', 'two_tracks.gpx')
    parser = SegmentParser.for(:gpx).new(path: file_path)

    segment = parser.segments.first
    expect(segment.name).to eq 'ACTIVE LOG: 20 SEP 2014 15:10'
    expect(segment.points_count).to eq 388
    expect(segment.h_up).to eq 561
    expect(segment.h_down).to eq 3970
  end
end
