class Api::V1::OnlineRankings::Groups::AnnualStandingsController < Api::ApplicationController
  CATEGORIES_ORDER = %w[wingsuit monotrack tracksuit slick].freeze

  def show
    @group = VirtualCompetition::Group.find(params[:group_id])
    @standings = @group.annual_standing_rows
                       .includes(profile: [:country, :contribution_details])
                       .where(wind_cancelled:, year: params[:year])
                       .where("#{rank_column} <= 20")
                       .order(rank_column)
                       .group_by(&:suits_kind)
                       .then { |standings| standings.sort_by { |key, _| CATEGORIES_ORDER.index(key) }.to_h }
  end

  private

  def wind_cancelled
    params.key?(:wind_cancellation) ? ActiveModel::Type::Boolean.new.cast(params[:wind_cancellation]) : true
  end

  def rank_column
    return 'rank' unless selected_task

    Arel.sql("(results->'#{selected_task}'->>'rank')::numeric")
  end

  def selected_task = VirtualCompetition.disciplines[params[:selected_task]]
end
