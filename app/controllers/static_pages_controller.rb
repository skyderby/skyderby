# encoding: utf-8
class StaticPagesController < ApplicationController
  def index
    @track_file = TrackFile.new
    @online_competitions = VirtualCompetitions::Summary.new
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
