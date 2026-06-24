module Tournaments
  module Qualifications
    module RespondWithScoreboard
      extend ActiveSupport::Concern

      def respond_with_scoreboard
        broadcast_qualification_scoreboard

        respond_to do |format|
          format.turbo_stream { render template: 'tournaments/qualifications/update_scoreboard' }
        end
      end

      def broadcast_qualification_scoreboard
        [true, false].each do |editable|
          Turbo::StreamsChannel.broadcast_render_later_to(
            [@tournament, :qualification, editable ? :editable : :read_only],
            template: 'tournaments/qualifications/broadcasts/scoreboard',
            locals: { tournament: @tournament, editable: }
          )
        end
      end
    end
  end
end
