class Api::Web::OnlineRankingsController < Api::Web::ApplicationController
  def index
    authorize VirtualCompetition

    @online_rankings = VirtualCompetition.includes(:group, :custom_intervals, place: :country)
  end

  def show
    authorize VirtualCompetition

    @online_ranking = VirtualCompetition.find(params[:id])
  end
end
