class CreateTrackService
  class MissingActivityData < StandardError; end

  def self.call(params, segment: 0)
    new(params, segment: segment).call
  end

  def initialize(params, segment: 0)
    @params = params.dup
    @segment = segment
  end

  def call
    track.transaction do
      set_profile
      set_file_metadata
      set_jump_range
      set_place
      save_track
      enque_jobs
    end

    track
  end

  private

  attr_reader :segment, :params

  def track
    @track ||= Track.new(params)
  end

  def set_profile
    track.pilot = track.user.profile if track.user && !params[:profile_id]
  end

  def set_file_metadata
    track.gps_type = track_file.file_format
    track.recorded_at = points.last.gps_time
    track.data_frequency = data_frequency
    track.missing_ranges = missing_ranges
  end

  def set_jump_range
    scan_result = TrackScanner.call(points)

    # track.flight_started_at = scan_result.flight_started_at
    # track.deployed_at = scan_result.deployed_at
    fl_time = points.find { |p| p.gps_time >= scan_result.flight_starts_at }.fl_time
    track.ff_start = fl_time
    fl_time = points.find { |p| p.gps_time >= scan_result.deploy_at }.fl_time
    track.ff_end = fl_time

    track.ff_start = jump_range.start_time
    track.ff_end = jump_range.end_time
  end

  def ensure_activity_recorded
    activity_found = ActivityDataLookup.call(points)
    raise MissingActivityData unless activity_found
  end

  def points
    @points ||= read_points_from_file(
      path: track_file.file_path,
      segment: segment,
      format: track_file.file_format
    )
  end

  def read_points_from_file(path:, segment:, format:)
    points = TrackParser.for(format).new(
      path: path,
      segment: segment
    ).parse

    PointsProcessor.for(format).new(points).execute
  end

  def track_file
    track.track_file
  end

  def data_frequency
    @data_frequency ||= DataFrequencyDetector.call(points)
  end

  def missing_ranges
    @missing_ranges ||= MissingRangesDetector.call(points, data_frequency)
  end

  def jump_range
    @jump_range ||= JumpRangeFinder.for(track.kind).call(points)
  end

  # Find and set place as closest to start of jump range
  # and set ground level if place found as place msl offset
  def set_place
    place = find_place jump_range.start_point, search_radius
    track.place = place
    track.ground_level = place.msl if place
  end

  # Record track, then assign to it points and
  # record points to db
  def save_track
    track.save!
    Point.bulk_insert points: points, track_id: track.id
  end

  def enque_jobs
    [ResultsJob, OnlineCompetitionJob, WeatherCheckingJob].each do |job|
      job.perform_later(track.id)
    end
  end

  def search_radius
    # Search radius for place in km
    # Base exit described as exit coordinates
    # Skydive dropzone descriped as landing area coordinates
    base_search_radius = 1
    skydive_search_radius = 10

    @track.base? ? base_search_radius : skydive_search_radius
  end

  def find_place(start_point, radius)
    Place.nearby(start_point, radius).first
  end
end
