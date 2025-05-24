class Events::ReferencePointsController < ApplicationController
  include EventScoped

  before_action :set_event
  before_action :authorize_event, except: :index
  before_action :set_reference_point, only: %i[update destroy]

  def create
    @reference_point = @event.reference_points.create!(
      name: "R#{@event.reference_points.size + 1}",
      latitude: @event.place.latitude,
      longitude: @event.place.longitude
    )
  end

  def index
    @reference_points = @event.reference_points.includes(:assignments).order(:name)
  end

  def update
    @reference_point.update(reference_points_params)

    respond_with_errors(@reference_point) if @reference_point.errors.any?
  end

  def destroy
    @reference_point.destroy!
  end

  private

  def set_reference_point
    @reference_point = @event.reference_points.find(params[:id])
  end

  def reference_points_params
    params.require(:reference_point).permit(:name, :latitude, :longitude)
  end
end
