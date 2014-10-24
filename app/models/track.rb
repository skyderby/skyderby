require 'parser_selector'
include ParserSelector

class Track < ActiveRecord::Base
  belongs_to :user
  belongs_to :wingsuit
  has_one :event_track
  has_many :tracksegments, :dependent => :destroy
  has_many :points, :through => :tracksegments

  attr_accessor :trackfile, :track_index

  enum kind: [:skydive, :base]
  enum visibility: [:public_track, :unlisted_track, :private_track]

  validates :name, :location, :suit, presence: true
  before_save :parse_file

  def charts_data
    track_data.points.to_json.html_safe
  end

  def earth_data
    track_data.points.map { |x| {:latitude => x[:latitude],
                                  :longitude => x[:longitude],
                                  :h_speed => x[:h_speed],
                                  :elevation => x[:abs_altitude].nil? ? x[:elevation] : x[:abs_altitude]} }
                      .to_json.html_safe
  end

  def max_height
    track_data.max_h.round
  end

  def min_height
    track_data.min_h.round
  end

  def heights_data
    track_data(false).points.map{ |p| [p[:fl_time_abs], p[:elevation]] }.to_json.html_safe
  end

  def duration
    track_data(false).points.map{ |p| p[:fl_time] }.inject(0, :+)
  end

  def presentation
    "#{self.name} | #{self.suit} | #{self.comment}"
  end

  private

  def track_data(trim = true)

    track_points = TrackPoints.new(self)
    track_points.trim!(self.ff_start, self.ff_end) if trim
    track_points

  end

  def parse_file

    if self.new_record?

      # TODO: Пережиток прошлого. Исправить
      trkseg = Tracksegment.create!
      self.tracksegments << trkseg

      parser = ParserSelector::choose(trackfile[:data], trackfile[:ext])
      return false if parser.nil?

      track_points = parser.parse track_index.to_i
      track_points.process_data!

      return false if track_points.points.count < 10

      track_points.create_points { |point| point.tracksegment = trkseg}

      self.ff_start = track_points.ff_start
      self.ff_end = track_points.ff_end

    end

  end

end
