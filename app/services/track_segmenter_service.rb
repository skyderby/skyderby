require 'csv'
require 'net/http'

class TrackSegmenterService
  def self.call(points)
    new(points).call
  end

  def initialize(points)
    @points = points
  end

  def call
    connection.request(request)
  end

  private

  attr_reader :points

  def request
    Net::HTTP::Post.new(uri.request_uri).tap do |req|
      req['Content-Type'] = 'text/csv'
      req.body = request_body
    end
  end

  def request_body
    CSV.generate do |csv|
      csv << %w[fl_time h_speed v_speed]
      points.each do |point|
        csv << [point.fl_time, point.h_speed, point.v_speed]
      end
    end
  end

  def connection
    @connection ||= Net::HTTP.new(uri.host, uri.port)
  end

  def uri
    @uri ||= URI.parse('http://localhost:8000/prediction')
  end
end
