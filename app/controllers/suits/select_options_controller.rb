class Suits::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @suits = Suit.includes(:manufacturer)
                 .order('manufacturers.name, suits.name')
                 .search(search_query)
                 .page(page).per(25)

    respond_with_no_results(params[:frame_id]) if @suits.empty? && @suits.current_page == 1
  end

  def search_query
    params[:term]
  end
end
