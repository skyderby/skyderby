class Tracks::PointsController < ApplicationController
  before_action :set_track

  def show
    authorize @track

    @points =
      PointsQuery
      .execute(@track, options)
      .then { |points| PointsPostprocessor.for(@track.gps_type).call(points) }
      .then { |points| convert_speed_to_ms(points) }
      .then do |points|
        @zerowind_points = Tracks::WindCancellation::Processor.call(points, @track.weather_data)
        augment_with_zerowind(points, @zerowind_points)
      end
  end

  private

  def augment_with_zerowind(points, zerowind_points)
    points.zip(zerowind_points).map do |point, zerowind_point|
      point[:zerowind_latitude] = zerowind_point ? zerowind_point[:latitude].to_f : nil
      point[:zerowind_longitude] = zerowind_point ? zerowind_point[:longitude].to_f : nil
      point[:zerowind_h_speed] = zerowind_point ? zerowind_point[:h_speed] : nil
      point[:zerowind_glide_ratio] = zerowind_point ? zerowind_point[:glide_ratio] : nil
      point
    end
  end

  # FIXME: Convert DB to ms, remove this
  def convert_speed_to_ms(points)
    points.each do |point|
      point[:h_speed] /= 3.6
      point[:v_speed] /= 3.6
      point[:full_speed] /= 3.6
    end
  end

  def set_track
    @track = Track.find(params[:track_id])
  end

  def options
    default_options.merge show_params
  end

  def show_params
    params
      .permit(:original_frequency, :trimmed, trimmed: [:seconds_before_start])
      .to_h.symbolize_keys
      .tap { |params| normalize_params(params) }
  end

  def normalize_params(params)
    params[:trimmed] = ActiveModel::Type::Boolean.new.cast(params[:trimmed]) if params.key?(:trimmed)
    params[:freq_1hz] = false if params[:original_frequency] == 'true'
  end

  def default_options
    { freq_1hz: true, trimmed: true }
  end
end
