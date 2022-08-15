class CreateTrackService
  class MissingActivityData < StandardError
    attr_reader :points

    def initialize(points)
      super
      @points = points
    end
  end

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
    end

    enque_jobs

    track
  end

  private

  attr_reader :segment, :params

  def track
    @track ||= Track.new(params)
  end

  def set_profile
    track.pilot ||= track.owner.profile if track.owner
  end

  def set_file_metadata
    track.gps_type = track_file.file_format
    track.recorded_at = points.last.gps_time
    track.data_frequency = data_frequency
    track.missing_ranges = missing_ranges
  end

  def set_jump_range
    track.ff_start = jump_range.start_time.to_i
    track.ff_end = jump_range.deploy_time.to_i
    track.require_range_review = jump_range.require_review?
  end

  def points
    @points ||= read_points_from_file(
      file: track_file.file,
      segment: segment,
      format: track_file.file_format
    )
  end

  def read_points_from_file(file:, segment:, format:)
    points = TrackParser.for(format).new(
      file: file,
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
    @jump_range ||= TrackScanner.call(points)
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
