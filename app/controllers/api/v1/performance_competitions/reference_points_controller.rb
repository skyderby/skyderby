class Api::V1::PerformanceCompetitions::ReferencePointsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement

  before_action :set_reference_point, only: %i[update destroy]

  def create
    @reference_point = @event.reference_points.new(new_reference_point_attributes)

    if @reference_point.save
      render :show, status: :created
    else
      render_record_errors @reference_point
    end
  end

  def update
    if @reference_point.update(reference_point_params)
      render :show
    else
      render_record_errors @reference_point
    end
  end

  def destroy
    if @reference_point.destroy
      head :no_content
    else
      render_record_errors @reference_point
    end
  end

  private

  def set_reference_point
    @reference_point = @event.reference_points.find(params[:id])
  end

  def reference_point_params = params.require(:reference_point).permit(:name, :latitude, :longitude)

  def new_reference_point_attributes
    defaults = {
      name: "R#{@event.reference_points.count + 1}",
      latitude: @event.place&.latitude,
      longitude: @event.place&.longitude
    }
    return defaults if params[:reference_point].blank?

    defaults.merge(reference_point_params.to_h.symbolize_keys.compact_blank)
  end
end
