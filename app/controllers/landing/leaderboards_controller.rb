class Landing::LeaderboardsController < ApplicationController
  layout false

  def show
    @leaderboard = Landing::Leaderboard.new
  end
end
