class Api::V1::ContributionsController < Api::ApplicationController
  def index
    authorize Contribution

    @contributions = Contribution.chronologically.paginate(page: current_page, per_page: rows_per_page)
  end
end
