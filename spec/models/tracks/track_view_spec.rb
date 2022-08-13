describe Tracks::TrackView do
  let(:range) { double(TrackRange, from: 3500, to: 3000) }

  it '#elevation' do
    stub_points_fetch(presenter)

    expect(presenter.elevation).to eq(500)
  end

  describe '#time' do
    it 'returns time if points present' do
      stub_points_fetch(presenter)

      expect(presenter.time).to eq(5)
    end

    it 'returns 0.0 if points blank' do
      allow(presenter).to receive(:track_points).and_return([])

      expect(presenter.time).to eq 0.0
    end
  end

  it '#glide_ratio' do
    stub_points_fetch(presenter)

    expect(presenter.glide_ratio).to eq(0.11)
  end

  it '#min_glide_ratio' do
    stub_points_fetch(presenter)

    expect(presenter.min_glide_ratio).to eq(2.1)
  end

  describe '#max_glide_ratio' do
    it 'returns max' do
      stub_points_fetch(presenter)

      expect(presenter.max_glide_ratio).to eq(2.5)
    end

    it 'returns 0.0 if no points given' do
      allow(presenter).to receive(:track_points).and_return([])

      expect(presenter.max_glide_ratio).to eq(0.0)
    end
  end

  it '#avg_vertical_speed' do
    stub_points_fetch(presenter)

    expect(presenter.avg_vertical_speed).to eq(360)
  end

  it '#min_vertical_speed' do
    stub_points_fetch(presenter)

    expect(presenter.min_vertical_speed).to eq(72)
  end

  it '#max_vertical_speed' do
    stub_points_fetch(presenter)

    expect(presenter.max_vertical_speed).to eq(252)
  end

  it '#avg_horizontal_speed' do
    stub_points_fetch(presenter)

    expect(presenter.avg_horizontal_speed).to eq(41)
  end

  it '#min_horizontal_speed' do
    stub_points_fetch(presenter)

    expect(presenter.min_horizontal_speed).to eq(72)
  end

  it '#max_horizontal_speed' do
    stub_points_fetch(presenter)

    expect(presenter.max_horizontal_speed).to eq(180)
  end

  it '#glide_ratio_chart_line' do
    stub_points_fetch(presenter)

    expect(presenter.glide_ratio_chart_line).to eq(<<~CHART.delete("\n"))
      [{"x":0.0,"y":2.1,"true_value":2.1},
      {"x":1.0,"y":2.2,"true_value":2.2},
      {"x":2.0,"y":2.3,"true_value":2.3},
      {"x":3.0,"y":2.4,"true_value":2.4},
      {"x":4.0,"y":2.5,"true_value":2.5},
      {"x":5.0,"y":2.2,"true_value":2.2}]
    CHART
  end

  it '#altitude_chart_line' do
    stub_points_fetch(presenter)

    expect(presenter.altitude_chart_line).to eq(<<~CHART.delete("\n"))
      [[0.0,3500],[1.0,3400],[2.0,3300],[3.0,3200],[4.0,3100],[5.0,3000]]
    CHART
  end

  it '#ground_speed_chart_line' do
    stub_points_fetch(presenter)

    expect(presenter.ground_speed_chart_line).to eq(<<~CHART.delete("\n"))
      [[0.0,72],[1.0,108],[2.0,144],[3.0,180],[4.0,180],[5.0,180]]
    CHART
  end

  it '#vertical_speed_chart_line' do
    stub_points_fetch(presenter)

    expect(presenter.vertical_speed_chart_line).to eq(<<~CHART.delete("\n"))
      [[0.0,72],[1.0,108],[2.0,144],[3.0,180],[4.0,216],[5.0,252]]
    CHART
  end

  it '#full_speed_chart_line' do
    stub_points_fetch(presenter)

    expect(presenter.full_speed_chart_line).to eq(<<~CHART.delete("\n"))
      [[0.0,102],[1.0,153],[2.0,204],[3.0,255],[4.0,281],[5.0,310]]
    CHART
  end

  it '#elevation_chart_line' do
    stub_points_fetch(presenter)

    expect(presenter.elevation_chart_line).to eq(<<~CHART.delete("\n"))
      [[0.0,0],[1.0,100],[2.0,200],[3.0,300],[4.0,400],[5.0,500]]
    CHART
  end

  it '#distance_chart_line' do
    stub_points_fetch(presenter)

    expect(presenter.distance_chart_line).to eq(<<~CHART.delete("\n"))
      [[0.0,0],[1.0,11],[2.0,23],[3.0,34],[4.0,45],[5.0,56]]
    CHART
  end

  def presenter
    track = Track.new(gps_type: :flysight)
    @presenter ||= Tracks::TrackView.new(track, range, ChartsPreferences.new({}), false)
  end

  def stub_points_fetch(object)
    start_time = 1.day.ago
    # rubocop:disable Layout/LineLength
    allow(object).to receive(:track_points).and_return \
      [
        { gps_time: start_time,     altitude: 3500, latitude: 24.8903, longitude: 55.54479, h_speed: 20, v_speed: 20, distance: 20, glide_ratio: 2.1 },
        { gps_time: start_time + 1, altitude: 3400, latitude: 24.8904, longitude: 55.54477, h_speed: 30, v_speed: 30, distance: 20, glide_ratio: 2.2 },
        { gps_time: start_time + 2, altitude: 3300, latitude: 24.8905, longitude: 55.54475, h_speed: 40, v_speed: 40, distance: 20, glide_ratio: 2.3 },
        { gps_time: start_time + 3, altitude: 3200, latitude: 24.8906, longitude: 55.54473, h_speed: 50, v_speed: 50, distance: 20, glide_ratio: 2.4 },
        { gps_time: start_time + 4, altitude: 3100, latitude: 24.8907, longitude: 55.54471, h_speed: 50, v_speed: 60, distance: 20, glide_ratio: 2.5 },
        { gps_time: start_time + 5, altitude: 3000, latitude: 24.8908, longitude: 55.54469, h_speed: 50, v_speed: 70, distance: 20, glide_ratio: 2.2 }
      ]
    # rubocop:enable Layout/LineLength
  end
end
