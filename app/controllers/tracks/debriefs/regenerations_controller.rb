module Tracks
  module Debriefs
    class RegenerationsController < ApplicationController
      def create
        return respond_not_authorized unless Current.user.admin?

        debrief = Track.find(params[:track_id]).debriefs.find(params[:debrief_id])
        redirect_to track_debrief_path(debrief.track, debrief.regenerate)
      end
    end
  end
end
