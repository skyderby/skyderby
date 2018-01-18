require 'csv'
require 'net/http'

class TrackScanner
  ScanResult = Struct.new(:flight_starts_at, :deploy_at, :activity)
  class NoFlightData < StandardError; end

  def self.call(points)
    new(points).call
  end

  def initialize(points)
    @points = points
  end

  def call
    response = connection.request(request)
    data = JSON.parse(response.body)
    ScanResult.new.tap do |r|
      r.flight_starts_at = Time.parse(data['flight_starts_at'] + 'Z')
      r.deploy_at = Time.parse(data['deploy_at'] + 'Z')
      r.activity = data['activity']
    end
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
      csv << %w[time h_speed v_speed]
      points.each do |point|
        csv << [point.gps_time.strftime('%Y-%m-%dT%H:%M:%S.%L'), point.h_speed, point.v_speed]
      end
    end
  end

  def connection
    @connection ||= Net::HTTP.new(uri.host, uri.port)
  end

  def uri
    @uri ||= URI.parse('http://localhost:8000/api/v1/scan')
  end
end
