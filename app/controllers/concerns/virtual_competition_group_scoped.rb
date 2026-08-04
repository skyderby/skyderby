module VirtualCompetitionGroupScoped
  extend ActiveSupport::Concern

  included do
    helper_method :scoreboard_filters
  end

  private

  def build_scoreboard(group, pages: scoreboard_pages)
    group.scoreboard(
      year: params[:year],
      gender: params[:gender],
      wind_cancellation: params[:wind].present?,
      pages:
    )
  end

  def scoreboard_pages
    pages = params.permit(pages: VirtualCompetition::Group::Scoreboard::SUIT_KINDS)[:pages]
    pages ? pages.to_h : {}
  end

  def scoreboard_filters
    params.permit(:year, :gender, :wind).to_h.compact_blank.symbolize_keys
  end
end
