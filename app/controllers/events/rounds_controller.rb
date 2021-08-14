module Events
  class RoundsController < ApplicationController
    include EventScoped

    before_action :set_event
    before_action :set_round, only: %i[destroy update]
    before_action :authorize_event

    def create
      @round = @event.rounds.new round_params

      if @round.save
        respond_to do |format|
          format.json
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors(@round.errors)
      end
    end

    def update
      if @round.update(update_round_params)
        respond_to do |format|
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors(@round.errors)
      end
    end

    def destroy
      if @round.destroy
        respond_to do |format|
          format.json { head :no_content }
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors(@round.errors)
      end
    end

    private

    def set_round
      @round = @event.rounds.find(params[:id])
    end

    def round_params
      params.require(:round).permit(:name, :discipline, :event_id)
    end

    def update_round_params = params.require(:round).permit(:completed)
  end
end
