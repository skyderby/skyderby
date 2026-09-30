module Api
  module V1
    module Tracks
      class ReferencePointsController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }, only: %i[update destroy]
        before_action :set_track
        before_action :require_editable, only: %i[update destroy]

        def show; end

        def update
          @reference_point = @track.reference_point || @track.build_reference_point
          if @reference_point.update(reference_point_params)
            @track.reload
            render :show
          else
            render_errors @reference_point.errors.full_messages, status: :unprocessable_content
          end
        end

        def destroy
          @track.reference_point&.destroy
          @track.reload
          render :show
        end

        private

        def set_track
          @track = Track.find(params[:track_id])
          render_errors(['Not found'], status: :not_found) unless @track.viewable?
        end

        def require_editable
          respond_not_authorized unless editable?
        end

        def editable?
          return false unless token_authenticated? && current_user.registered?

          current_user.admin? || @track.recorded_by?(current_user)
        end
        helper_method :editable?

        def reference_point_params
          params.expect(reference_point: %i[latitude longitude])
        end
      end
    end
  end
end
