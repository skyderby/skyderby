class Suits::ComparisonOptionsController < ApplicationController
  LIMIT = 30

  layout false

  before_action :set_suit

  def index
    authorize @suit

    @comparison = Suits::ExitComparison.new(@suit, params[:compare])
    @suits =
      Suit
      .joins(:exit_performance)
      .includes(:manufacturer, :exit_performance)
      .where.not(id: @comparison.compared_ids + [@suit.id])
      .search(params[:term])
      .order('manufacturers.name, suits.name')
      .limit(LIMIT)
  end

  private

  def set_suit
    @suit = Suit.find(params[:suit_id])
  end
end
