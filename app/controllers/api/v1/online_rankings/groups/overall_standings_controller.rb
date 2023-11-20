class Api::V1::OnlineRankings::Groups::OverallStandingsController < Api::ApplicationController
  def show
    @group = VirtualCompetition::Group.find(params[:group_id])
    @standings = @group.overall_standing_rows
                       .includes(profile: [:country, :contribution_details])
                       .where(rank: 1..20, wind_cancelled:).group_by(&:suits_kind)
  end

  private

  def wind_cancelled
    params.key?(:wind_cancellation) ? ActiveModel::Type::Boolean.new.cast(params[:wind_cancellation]) : true
  end
end
