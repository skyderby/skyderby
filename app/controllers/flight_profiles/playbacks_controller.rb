module FlightProfiles
  class PlaybacksController < ApplicationController
    def create
      @quota = FlightProfilePlayback::Quota.new(Current.user)
      @status = @quota.grant(params[:track_ids])

      render formats: :json, status: @status == :sign_in_required ? :unauthorized : :ok
    end
  end
end
