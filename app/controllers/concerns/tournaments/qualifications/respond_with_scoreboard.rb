module Tournaments
  module Qualifications
    module RespondWithScoreboard
      extend ActiveSupport::Concern

      def respond_with_scoreboard
        @scoreboard = Qualifications::Scoreboard.new(@tournament)

        respond_to do |format|
          format.js { render template: 'tournaments/qualifications/update_scoreboard' }
        end
      end
    end
  end
end
