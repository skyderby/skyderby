module Tracks
  class OwnershipsController < ApplicationController
    before_action :set_track, :authorize_action

    def show
      @ownership = Track::Ownership.new(@track)
    end

    def update
      respond_to do |format|
        if @track.update(ownership_params)
          format.js { redirect_to @track }
        else
          format.js { render 'errors/ajax_errors', locals: { errors: @track.errors } }
        end
      end
    end

    private

    def ownership_params
      params_in_scope = params.require(:track_ownership)

      type = params_in_scope[:type]
      owner =
        if type == 'None'
          { owner: nil }
        else
          { owner_type: type, owner_id: params_in_scope["#{type.downcase}_id"] }
        end

      owner.merge(profile_id: params_in_scope[:profile_id])
    end

    def set_track
      @track = Track.includes(:pilot).find(params[:track_id])
    end

    def authorize_action
      authorize [:track, :ownership]
    end
  end
end
