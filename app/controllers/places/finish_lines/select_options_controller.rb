class Places::FinishLines::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @finish_lines =
      finish_lines
      .order(:name)
      .then { |scope| search_term.present? ? scope.where('name ILIKE ?', "%#{search_term}%") : scope }
      .page(page).per(25)

    respond_with_no_results(params[:frame_id]) if @finish_lines.empty? && @finish_lines.current_page == 1
  end

  private

  def finish_lines
    return Place::FinishLine.none if params[:place_id].blank?

    Place::FinishLine.where(place_id: params[:place_id])
  end

  def search_term = params[:term]
end
