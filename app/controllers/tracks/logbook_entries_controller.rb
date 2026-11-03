module Tracks
  class LogbookEntriesController < ApplicationController
    include LogbookScoped

    def create
      track = Track.find(params[:track_id])
      return respond_not_authorized unless track.loggable?

      redirect_to edit_logbook_jump_path(Jump.record_track(track))
    end
  end
end
