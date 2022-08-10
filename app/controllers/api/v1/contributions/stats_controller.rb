class Api::V1::Contributions::StatsController < Api::ApplicationController
  def show
    authorize Contribution, :index?

    @stats = Contribution::Summary.new
  end
end
