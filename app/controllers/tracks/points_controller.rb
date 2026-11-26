class Tracks::PointsController < ApplicationController
  before_action :set_track

  def show
    return respond_not_authorized unless @track.viewable?

    @points = @track.flight_points(**options.slice(:trimmed, :freq_1hz))
  end

  private

  def set_track
    @track = Track.find(params[:track_id])
  end

  def options
    default_options.merge show_params
  end

  def show_params
    params
      .permit(:original_frequency, :trimmed, trimmed: [:seconds_before_start, :seconds_after_end])
      .to_h.symbolize_keys
      .tap { |params| normalize_params(params) }
  end

  def normalize_params(params)
    params[:trimmed] = ActiveModel::Type::Boolean.new.cast(params[:trimmed]) if params[:trimmed].is_a?(String)
    params[:freq_1hz] = false if params[:original_frequency] == 'true'
  end

  def default_options
    { freq_1hz: true, trimmed: true }
  end
end
