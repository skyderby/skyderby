class Suits::SelectOptionsController < ApplicationController
  layout false

  def index
    @suits = Suit.includes(:manufacturer)
                 .order('manufacturers.name, suits.name')
                 .search(search_query)
                 .paginate(page:, per_page: 25)
  end

  def search_query
    params[:term]
  end
end
