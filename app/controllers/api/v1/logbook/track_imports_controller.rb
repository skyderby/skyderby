module Api
  module V1
    module Logbook
      class TrackImportsController < Api::ApplicationController
        include ApiLogbookScoped

        def show
          @logbook = ::Profiles::Logbook.new(logbook_profile, kind: params[:kind])
          @years = @logbook.import_years
          @year = params[:year].presence&.to_i || @years.first
        end

        def create
          logbook = ::Profiles::Logbook.new(logbook_profile, kind: params[:kind])
          tracks = logbook.importable_tracks.where(id: params[:track_ids]).sort_by { it.exited_at || it.recorded_at }
          Jump.transaction { tracks.each { Jump.record_track(it) } }

          render json: { imported: tracks.size }, status: :created
        end
      end
    end
  end
end
