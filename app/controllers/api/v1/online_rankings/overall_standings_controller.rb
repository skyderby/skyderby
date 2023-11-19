class Api::V1::OnlineRankings::OverallStandingsController < Api::ApplicationController
  def show
    competition = VirtualCompetition.find(params[:online_ranking_id])

    @scores = competition.personal_top_scores
                         .wind_cancellation(false)
                         .includes(track: [place: :country],
                                   suit: :manufacturer,
                                   profile: [:country, :contribution_details])
                         .paginate(page: current_page, per_page: rows_per_page)
  end
end
