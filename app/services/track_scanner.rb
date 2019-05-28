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

    def require_review?
      false
    end
  end

  class NullRange
    def initialize(points)
      @points = points
    end

    def start_point
      points.first
    end

    def deploy_point
      points.last
    end

    def start_time
      start_point.fl_time
    end

    def deploy_time
      deploy_point.fl_time
    end

    def require_review?
      true
    end

    private

    attr_reader :points
  end

  ##
  # Exception that raised when service failed to find flight data in given
  # dataset
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
  rescue NoFlightData
    NullRange.new(points)
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
    raise NoFlightData if response.code == '422' && data['error'] == 'no flight data'
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
      csv << %w[time hMSL h_speed v_speed]
      points.each do |point|
        csv << [point['gps_time'].strftime('%Y-%m-%dT%H:%M:%S.%L'),
                point['abs_altitude'],
                point['h_speed'].round(1),
                point['v_speed'].round(1)]
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
