module Api
  module TournamentManagement
    extend ActiveSupport::Concern

    included do
      include Api::TournamentScoped
      include Api::EventManagement
      include ::Tournaments::Qualifications::RespondWithScoreboard
    end
  end
end
