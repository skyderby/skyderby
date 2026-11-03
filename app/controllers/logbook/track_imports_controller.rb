module Logbook
  class TrackImportsController < ApplicationController
    include LogbookScoped

    def new
      @logbook = Profiles::Logbook.new(logbook_profile, kind: params[:kind])
      @year = params[:year].presence&.to_i || @logbook.import_years.first
    end

    def create
      logbook = Profiles::Logbook.new(logbook_profile, kind: params[:kind])
      Jump.transaction do
        logbook.importable_tracks
               .where(id: params[:track_ids])
               .sort_by { |track| track.exited_at || track.recorded_at }
               .each { |track| Jump.record_track(track) }
      end

      redirect_to logbook_path(kind: logbook.kind)
    end
  end
end
