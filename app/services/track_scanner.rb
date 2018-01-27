require 'csv'
require 'net/http'

class TrackScanner
  ScanResult = Struct.new(:start_point, :deploy_point) do
    def start_time
      start_point.fl_time
    end

    def deploy_time
      deploy_point.fl_time
    end
  end

  class NoFlightData < StandardError; end

  def self.call(points)
    new(points).call
  end

  def initialize(points)
    @points = points
  end

  def call
    response = connection.request(request)

    check_status response
    convert response
  end

  private

  attr_reader :points

  def request
    Net::HTTP::Post.new(uri.request_uri).tap do |req|
      req['Content-Type'] = 'text/csv'
      req.body = request_body
    end
  end

  def check_status(response)
    return if response.code == '200'

    data = JSON.parse(response.body)
    if response.code == '422' && data['error'] == 'no flight data'
      raise NoFlightData
    end
  end

  def convert(response)
    data = JSON.parse(response.body)
    ScanResult.new.tap do |r|
      r.start_point  = closest_point_to Time.zone.parse(data['flight_starts_at'])
      r.deploy_point = closest_point_to Time.zone.parse(data['deploy_at'])
    end
  end

  def closest_point_to(time)
    points.bsearch { |p| p['gps_time'] >= time }
  end

  def request_body
    CSV.generate do |csv|
      csv << %w[time h_speed hMSL v_speed]
      points.each do |point|
        csv << [point['gps_time'].strftime('%Y-%m-%dT%H:%M:%S.%L'),
                point['h_speed'],
                point['abs_altitude'],
                point['v_speed']]
      end
    end
  end

  def connection
    @connection ||= Net::HTTP.new(uri.host, uri.port)
  end

  def uri
    @uri ||= URI.parse("#{service_address}/api/v1/scan")
  end

  def service_address
    Rails.configuration.track_scanner['url']
  end
end
