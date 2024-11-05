class Api::Web::Contributions::StatsController < Api::Web::ApplicationController
  def show
    authorize Contribution, :index?

    @stats = Contribution::Summary.new
  end
end
