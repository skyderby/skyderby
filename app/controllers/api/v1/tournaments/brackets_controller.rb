module Api
  module V1
    module Tournaments
      class BracketsController < Api::ApplicationController
        include Api::TournamentScoped

        def show
          fresh_when etag: [
            @tournament,
            change_marker(@tournament.rounds),
            change_marker(@tournament.matches),
            change_marker(Tournament::Match::Slot.where(match_id: @tournament.matches.select(:id))),
            change_marker(@tournament.competitors)
          ]
        end
      end
    end
  end
end
