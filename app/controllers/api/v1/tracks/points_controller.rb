module Api
  module V1
    module Tracks
      class PointsController < ApplicationController
        def show
          authorize track

          @points =
            PointsQuery
            .execute(track, options)
            .then { |points| PointsPostprocessor.for(track.gps_type).call(points) }
            .then { |points| convert_speed_to_ms(points) }
        end

        private

        # FIXME: Convert DB to ms, remove this
        def convert_speed_to_ms(points)
          points.each do |point|
            point[:h_speed] /= 3.6
            point[:v_speed] /= 3.6
          end
        end

        def track
          @track ||= Track.find(params[:track_id])
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
          if params.key?(:trimmed) && params[:trimmed].is_a?(String)
            params[:trimmed] = params[:trimmed].to_s == 'true'
          end
          params[:freq_1hz] = false if params[:original_frequency] == 'true'
        end

        def default_options
          { freq_1hz: true, trimmed: true }
        end
      end
    end
  end
end
