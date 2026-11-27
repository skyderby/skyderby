class Tracks::PointsController < ApplicationController
  before_action :set_track

  def show
    return respond_not_authorized unless @track.viewable?

    @points = params[:original_frequency] == 'true' ? selected_points : selected_points.at_1hz
  end

  private

  def set_track
    @track = Track.find(params[:track_id])
  end

  def selected_points
    trimmed = params.permit(:trimmed, trimmed: [:seconds_before_start, :seconds_after_end])[:trimmed]
    return @track.freefall_points.extended(**padding(trimmed)) if trimmed.is_a?(ActionController::Parameters)
    return @track.recorded_points if trimmed && !ActiveModel::Type::Boolean.new.cast(trimmed)

    @track.freefall_points
  end

  def padding(trimmed) = { before: trimmed[:seconds_before_start].to_r, after: trimmed[:seconds_after_end].to_r }
end
