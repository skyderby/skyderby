class WeatherFetchingLogsController < ApplicationController
  def index
    unless WeatherFetchingLog.accessible?
      respond_not_authorized
      return
    end

    @records = WeatherFetchingLog.all
  end
end
