module VirtualCompetitionGroupScoped
  extend ActiveSupport::Concern

  included do
    helper_method :scoreboard_filters
  end

  private

  def build_scoreboard(group, pages: scoreboard_pages, suit: requested_suit)
    options = {
      year: params[:year],
      gender: params[:gender],
      wind_cancellation: ActiveModel::Type::Boolean.new.cast(params[:wind].presence) || false,
      pages:
    }
    suit ? group.suit_scoreboard(suit, **options) : group.scoreboard(**options)
  end

  def requested_suit = params[:suit_id].present? ? Suit.find(params[:suit_id]) : nil

  def scoreboard_pages
    pages = params.permit(pages: VirtualCompetition::Group::Scoreboard::SUIT_KINDS)[:pages]
    pages ? pages.to_h : {}
  end

  def scoreboard_filters
    params.permit(:year, :gender, :wind).to_h.compact_blank.symbolize_keys
  end
end
