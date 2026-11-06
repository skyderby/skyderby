module Api
  module V1
    module FlightProfiles
      class PlaybacksController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }, only: :create
        before_action :require_registered_user!
        before_action :set_quota

        def show; end

        def create
          @status = @quota.grant(params.require(:track_ids))
        end

        private

        def set_quota
          @quota = FlightProfilePlayback::Quota.new(current_user)
        end
      end
    end
  end
end
