class ExitMeasurementsController < ApplicationController
  def show
    @jump_profile = Place::JumpLine.find(params[:id])
    @measurements = @jump_profile.measurements.order(:altitude)
  end
end
