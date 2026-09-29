module Api
  module V1
    module Tournaments
      class QualificationsController < Api::ApplicationController
        include Api::TournamentScoped

        def show
          raise ActiveRecord::RecordNotFound unless @tournament.has_qualification

          @scoreboard = Tournament::Qualification::Scoreboard.new(@tournament)
          fresh_when etag: [
            @tournament,
            change_marker(@tournament.qualification_rounds),
            change_marker(@tournament.qualification_jumps),
            change_marker(@tournament.competitors)
          ]
        end
      end
    end
  end
end
