module FlightProfiles
  class PlaybacksController < ApplicationController
    def create
      @quota = FlightProfilePlayback::Quota.new(Current.user)
      status = @quota.grant(params.fetch(:track_ids, []))

      render json: {
        status:,
        unlimited: @quota.unlimited?,
        limit: @quota.limit,
        remaining: @quota.remaining,
        track_ids: @quota.counted_track_ids
      }, status: status == :sign_in_required ? :unauthorized : :ok
    end
  end
end
