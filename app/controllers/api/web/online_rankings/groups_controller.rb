class Api::Web::OnlineRankings::GroupsController < Api::Web::ApplicationController
  def show
    @group = VirtualCompetition::Group.includes(:virtual_competitions).find(params[:id])
  end
end
