class Api::V1::OnlineRankings::GroupsController < Api::ApplicationController
  def show
    @group = VirtualCompetition::Group.includes(:virtual_competitions).find(params[:id])
  end
end
