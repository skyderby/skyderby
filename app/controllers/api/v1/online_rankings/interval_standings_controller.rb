class Api::V1::OnlineRankings::IntervalStandingsController < Api::ApplicationController
  def show
    competition = VirtualCompetition.find(params[:online_ranking_id])
    interval = competition.intervals.find_by!(slug: params[:slug])

    @scores = competition.interval_top_scores
                         .for(interval)
                         .wind_cancellation(false)
                         .includes(track: [place: :country],
                                   suit: :manufacturer,
                                   profile: [:country, :contribution_details])
                         .paginate(page: current_page, per_page: rows_per_page)
  end
end
