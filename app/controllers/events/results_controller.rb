module Events
  class ResultsController < ApplicationController
    include EventScoped
    include UnitsHelper
    include ChartParams

    before_action :set_event
    before_action :set_event_result, only: [:show, :edit, :update, :destroy]
    before_action :authorize_event, except: :show

    def create
      @result = @event.results.new result_params

      if @result.save
        respond_to do |format|
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors @result.errors
      end
    end

    def update
      if @result.update result_params
        respond_to do |format|
          format.js { respond_with_scoreboard }
        end
      else
        respond_with_errors @result.errors
      end
    end

    def destroy
      if @result.destroy
        respond_to do |format|
          format.js { respond_with_scoreboard }
          format.json { head :no_content }
        end
      else
        respond_with_errors @result.errors
      end
    end

    def new
      @result = @event.results.new result_params
    end

    def edit; end

    def show
      raise Pundit::NotAuthorizedError unless policy(@event).show?

      @track_presenter = Tracks::CompetitionTrackView.new(
        @result,
        ChartsPreferences.new(session)
      )

      respond_to do |format|
        format.html
        format.js
      end
    end

    private

    def set_event_result
      @result = @event.results.find(params[:id])
    end

    def respond_with_scoreboard
      create_scoreboard(params[:event_id])
      render template: 'events/results/scoreboard_with_highlight'
    end

    def result_params
      params.require(:result).permit(
        :competitor_id,
        :round_id,
        :track_id,
        :track_from,
        track_attributes: [:file]
      )
    end

    def show_params
      params.permit(:charts_mode, :charts_units)
    end
    helper_method :show_params
  end
end
