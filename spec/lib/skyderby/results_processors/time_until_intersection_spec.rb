require 'spec_helper'
describe Skyderby::ResultsProcessors::TimeUntilIntersection do
  def read_points_from_file filename
    pilot = create :pilot
    wingsuit = create :wingsuit

    track_file = TrackFile.create(
      file: File.new("#{Rails.root}/spec/support/tracks/#{filename}")
    )

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      wingsuit: wingsuit
    }
    track = CreateTrackService.new(pilot.user, params, 0).execute
    Skyderby::Tracks::Points.new(track)
  end

  let(:finish_line) do
    # 60 meters line
    # [
    #   Skyderby::Tracks::TrackPoint.new(latitude: 62.0546537, longitude: 6.9452849),
    #   Skyderby::Tracks::TrackPoint.new(latitude: 62.0551915, longitude: 6.9454070)
    # ]
    # 250 meters line
    [
      Skyderby::Tracks::TrackPoint.new(latitude: 62.053858, longitude: 6.945123),
      Skyderby::Tracks::TrackPoint.new(latitude: 62.056071, longitude: 6.945568)
    ]
  end

  # Round 1
  #
  it 'calculates time between given and line intersection. Ratmir' do
    start_time = Time.zone.parse('2015-07-02 11:45:38.185')
    track_points = read_points_from_file '11-40-01_Ratmir.CSV'

    result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
      track_points, start_time: start_time, finish_line: finish_line
    ).calculate

    expect(result).to eq(33.543)
  end
  #
  # it 'calculates time between given and line intersection. Frode' do
  #   start_time = Time.zone.parse('2015-07-02 12:11:54.734')
  #   track_points = read_points_from_file '12-06-56_Frode.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.594)
  # end
  #
  # it 'calculates time between given and line intersection. Alex' do
  #   start_time = Time.zone.parse('2015-07-02 11:50:45.053')
  #   track_points = read_points_from_file '11-46-41_Alex.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(31.843)
  # end
  #
  # it 'calculates time between given and line intersection. Andreas' do
  #   start_time = Time.zone.parse('2015-07-02 13:46:11.447')
  #   track_points = read_points_from_file '13-35-43_Andreas.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(32.822)
  # end
  #
  # it 'calculates time between given and line intersection. Jay' do
  #   start_time = Time.zone.parse('2015-07-02 11:57:51.889')
  #   track_points = read_points_from_file '11-54-27 Jay.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end
  #
  # it 'calculates time between given and line intersection. Lori' do
  #   start_time = Time.zone.parse('2015-07-02 12:31:42.855')
  #   track_points = read_points_from_file 'R1/07-14-01_Lori.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end

  # it 'calculates time between given and line intersection. Rudy' do
  #   start_time = Time.zone.parse('2015-07-02 12:27:37.255')
  #   track_points = read_points_from_file 'R1/12-25-31_Rudy.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end

  # it 'calculates time between given and line intersection. Fernando' do
  #   start_time = Time.zone.parse('2015-07-02 12:27:37.255')
  #   track_points = read_points_from_file 'R1/12-14-55_Fernando.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end


  #
  # # Round 2
  # #
  # it 'calculates time between given and line intersection. Rudy' do
  #   start_time = Time.zone.parse('2015-07-03 10:42:59.907')
  #   track_points = read_points_from_file 'R2/10-35-57_Rudy.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end
  #
  # it 'calculates time between given and line intersection. Kristian' do
  #   start_time = Time.zone.parse('2015-07-03 10:48:00.029')
  #   track_points = read_points_from_file 'R2/10-42-28_Kristian.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end
  #
  # it 'calculates time between given and line intersection. Maksim' do
  #   start_time = Time.zone.parse('2015-07-03 11:08:46.442')
  #   track_points = read_points_from_file 'R2/10-58-01_Maksim.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end
  #
  # # Didn't intersect finish line
  it 'calculates time between given and line intersection. Ratmir' do
    start_time = Time.zone.parse('2015-07-03 11:10:30.450')
    track_points = read_points_from_file 'R2/11-05-01_Ratmir.CSV'

    result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
      track_points, start_time: start_time, finish_line: finish_line
    ).calculate

    expect(result).to be_nil
  end
  #
  # # Round 3
  # # Frode and Jay jumped in pair
  # it 'calculates time between given and line intersection. Frode' do
  #   start_time = Time.zone.parse('2015-07-03 12:37:25.735')
  #   track_points = read_points_from_file 'R3/12-31-03_Frode.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end
  #
  # it 'calculates time between given and line intersection. Jay' do
  #   start_time = Time.zone.parse('2015-07-03 12:37:25.735')
  #   track_points = read_points_from_file 'R3/12-26-20_Jay.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end
  #
  # # Brandon and Fernando jumped in pair
  # it 'calculates time between given and line intersection. Brandon' do
  #   start_time = Time.zone.parse('2015-07-03 12:32:45.052')
  #   track_points = read_points_from_file 'R3/12-28-29_Brandon.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end

  # it 'calculates time between given and line intersection. Fernando' do
  #   start_time = Time.zone.parse('2015-07-03 12:32:45.052')
  #   track_points = read_points_from_file 'R3/12-04-19_Fernando.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end
  #
  # it 'calculates time between given and line intersection. Kristian' do
  #   start_time = Time.zone.parse('2015-07-03 12:26:31.325')
  #   track_points = read_points_from_file 'R3/12-22-10_Kristian.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end
  #
  # Lori jumped with Andreas 
  # it 'calculates time between given and line intersection. Lori' do
  #   start_time = Time.zone.parse('2015-07-03 12:42:57.394')
  #   track_points = read_points_from_file 'R3/07-30-05_Lori.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end
  #
  # it 'calculates time between given and line intersection. Andreas' do
  #   start_time = Time.zone.parse('2015-07-03 12:42:57.394')
  #   track_points = read_points_from_file 'R3/12-29-24_Andreas.CSV'
  #
  #   result = Skyderby::ResultsProcessors::TimeUntilIntersection.new(
  #     track_points, start_time: start_time, finish_line: finish_line
  #   ).calculate
  #
  #   expect(result).to eq(33.865)
  # end

end
