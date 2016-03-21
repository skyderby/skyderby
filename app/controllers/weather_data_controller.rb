class WeatherDataController < ApplicationController
  respond_to :json

  before_filter :load_weather_datumable
  before_filter :authorize_parent, except: :index
  before_action :set_weather_datum, only: [:update, :destroy]

  def index
    @weather_data = @weather_datumable.weather_data
  end

  def create
    @weather_datum = @weather_datumable.weather_data.new weather_data_params

    if @weather_datum.save
      @weather_datum
    else
      render json: @weather_datum.errors, status: :unprocessable_entity
    end
  end

  def update
    if @weather_datum.update weather_data_params
      @weather_datum
    else
      render json: @weather_datum.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @weather_datum.destroy
    head :no_content
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

  def weather_data_params
    params.require(:weather_datum).permit :actual_on,
                                          :altitude,
                                          :wind_speed,
                                          :wind_direction
  end
end
