module Api
  module V1
    module Tracks
      class ProViewsController < Api::ApplicationController
        before_action :require_registered_user!

        def create
          @track = Track.find(params[:track_id])
          return render_errors(['Not found'], status: :not_found) unless @track.viewable?

          @status = FreeProView.grant(user: current_user, track: @track)
        end
      end
    end
  end
end
