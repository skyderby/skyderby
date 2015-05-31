# encoding: utf-8
class StaticPagesController < ApplicationController
  def index
    @track = Track.new
    @competitions = 
      VirtualCompetition.joins(:group)
                        .where('virtual_comp_groups.display_on_start_page = ?', true)
                        .order('virtual_comp_groups.name')
                        .group_by { |x| x.group.name }

  end

  def manage
    authorize! :manage, :all
  end

  def terms
  end

  def about
  end

  def competitions
    @summary = Skyderby::CompetitionsSummary.new
  end
end
