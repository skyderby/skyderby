module Api
  module V1
    module Tracks
      class PointsController < ApplicationController
        def show
          return respond_not_authorized unless track.viewable?

          @points = freq_1hz? ? selected_points.at_1hz : selected_points
        end

        private

        def track
          @track ||= Track.find(params[:track_id])
        end

        def selected_points
          trimmed = params.permit(trimmed: {})[:trimmed]
          return track.freefall_points unless trimmed

          track.freefall_points.extended(before: trimmed[:seconds_before_start].to_r,
                                         after: trimmed[:seconds_after_end].to_r)
        end

        def freq_1hz?
          return true unless params.key?(:freq_1_hz)

          ActiveModel::Type::Boolean.new.cast(params[:freq_1_hz])
        end
      end
    end
  end
end
