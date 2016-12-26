# encoding: utf-8
class StaticPagesController < ApplicationController
  def index
    @track_file = TrackFile.new
    @online_competitions =
      VirtualCompetition
      .where(display_on_start_page: true)
      .includes(personal_top_scores: [:profile, :track])
      .group_by(&:jumps_kind)
  end

  def manage
    authorize! :manage, :all
  end

  # End point for NewRelic availability monitoring
  def ping
    head :ok
  end

  def about; end
end
