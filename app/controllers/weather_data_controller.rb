class WeatherDataController < ApplicationController
  respond_to :json, :js

  before_filter :load_weather_datumable
  before_filter :authorize_parent, except: :index
  before_action :set_weather_datum, only: [:edit, :update, :destroy]
  before_action :set_view_units

  def index
    @weather_data = @weather_datumable.weather_data.order(:actual_on, :altitude)
    @weather_datum = WeatherDatum.new
  end

  def create
    @weather_datum = @weather_datumable.weather_data.new weather_data_params

    if @weather_datum.save
      @weather_datum
    else
      respond_to do |format|
        format.js { render 'errors/ajax_errors', locals: {errors: @weather_datum.errors} }
        format.json { render json: @weather_datum.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    if @weather_datum.update weather_data_params
      @weather_datum
    else
      respond_to do |format|
        format.js { render 'errors/ajax_errors', locals: {errors: @weather_datum.errors} }
        format.json { render json: @weather_datum.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @weather_datum.destroy
    head :no_content
  end

  def new
  end

  def edit
  end

  private

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
