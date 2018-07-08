module TournamentScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_tournament
  end

  def respond_with_scoreboard
    render 'tournaments/scoreboard'
  end

  def set_tournament
    @tournament = Tournament.find(params[:tournament_id])
  end
end
