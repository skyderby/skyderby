class VirtualCompetitionsController < ApplicationController
  before_action :set_competition, only: [:show, :edit, :update]

  def index
    @competitions = VirtualCompetition.includes(:group).group_by { |x| x.group.name }
  end

  def show
  end

  def edit
    authorize! :update, @competition
  end

  def update
    if @competition.update competition_params
      @competition.reprocess_results
      redirect_to @competition, notice: 'Данные успешно обновлены.'
    else
      redirect_to @competition, notice: 'При сохранении произошла ошибка.'
    end
  end

  private

  def set_competition
    @competition = VirtualCompetition.find(params[:id])
  end

  def competition_params
    params.require(:virtual_competition).permit(
      :name,
      :place,
      :jumps_kind,
      :suits_kind,
      :discipline,
      :discipline_parameter)
  end
end
