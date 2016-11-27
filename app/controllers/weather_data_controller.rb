class WeatherDataController < ApplicationController
  before_filter :load_weather_datumable
  before_filter :authorize_parent, except: :index
  before_action :set_weather_datum, only: [:edit, :update, :destroy]
  before_action :set_view_units

  respond_to :js

  def index
    respond_with_index
  end

  def create
    @weather_datum = @weather_datumable.weather_data.new weather_data_params

    if @weather_datum.save
      respond_with_index
    else
      render 'errors/ajax_errors', locals: {errors: @weather_datum.errors} 
    end
  end

  def update
    if @weather_datum.update weather_data_params
      @weather_datum
    else
      render 'errors/ajax_errors', locals: {errors: @weather_datum.errors}
    end
  end

  def destroy
    @weather_datum.destroy
    respond_with_index
  end

  def new
  end

  def edit
  end

  private

  def respond_with_index
    @weather_data = @weather_datumable.weather_data.order(:actual_on, :altitude)
    @weather_datum = WeatherDatum.new

    render :index
  end

  def load_weather_datumable
    klass = [Event, Track].detect { |c| params["#{c.name.underscore}_id"] }
    @weather_datumable = klass.find(params["#{klass.name.underscore}_id"])
  end

  def set_weather_datum
    @weather_datum = WeatherDatum.find(params[:id])
  end

  def authorize_parent
    authorize! :update, @weather_datumable
  end

  def set_view_units
    @view_units = {altitude: params[:altitude_unit] || 'm',
                   wind_speed: params[:wind_speed_unit] || 'ms'}
  end

  def weather_data_params
    params.require(:weather_datum).permit :actual_on,
                                          :altitude,
                                          :altitude_in_units,
                                          :altitude_unit,
                                          :wind_speed,
                                          :wind_speed_in_units,
                                          :wind_speed_unit,
                                          :wind_direction
  end
end
