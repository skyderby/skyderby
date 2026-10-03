module Api
  module V1
    module Tournaments
      class CompetitorsCopiesController < Api::ApplicationController
        include Api::TournamentManagement

        def create
          source = Tournament.find(params.require(:source_tournament_id))
          raise ActiveRecord::RecordNotFound unless source.viewable?

          @tournament.copy_competitors_from!(source)
          broadcast_qualification_scoreboard if @tournament.has_qualification

          head :no_content
        rescue ActiveRecord::RecordInvalid => e
          render_record_errors e.record
        end
      end
    end
  end
end
