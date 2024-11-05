class Api::Web::ContributionsController < Api::Web::ApplicationController
  def index
    authorize Contribution

    @contributions = Contribution.chronologically.paginate(page: current_page, per_page: rows_per_page)
  end
end
