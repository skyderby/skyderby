class VirtualCompetitionsController < ApplicationController
  def index
    @competitions = VirtualCompetition
                     .all.group_by { |x| x.group.name }
  end

  def show
    @competition = VirtualCompetition.find(params[:id])
  end
end
