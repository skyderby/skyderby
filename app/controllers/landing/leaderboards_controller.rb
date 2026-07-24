class Landing::LeaderboardsController < ApplicationController
  layout false

  def show
    return redirect_to root_path unless turbo_frame_request?

    @leaderboard = Landing::Leaderboard.new
  end
end
