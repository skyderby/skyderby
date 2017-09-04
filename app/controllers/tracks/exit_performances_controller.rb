module Tracks
  class ExitPerformancesController < ApplicationController
    def show
      @exit_performance = ExitPerformance.new(params[:track_id])
    end
  end
end
