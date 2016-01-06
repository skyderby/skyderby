class VirtualCompetitionsController < ApplicationController
  before_action :set_competition, only: [:show, :edit, :update]

  def index
    @competitions = VirtualCompetition.includes(:group).group_by { |x| x.group.name }
  end

  def new
    @competition = VirtualCompetition.new
  end

  def show
  end

  def edit
    authorize! :update, @competition
  end

  def create
    @competition = VirtualCompetition.new(competition_params)

    if @competition.save
      redirect_to @competition, notice: 'Competition was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    if @competition.update competition_params
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
      :virtual_comp_group_id,
      :period_from,
      :period_to,
      :place,
      :jumps_kind,
      :suits_kind,
      :discipline,
      :discipline_parameter,
      :display_on_start_page,
      :display_highest_speed,
      :display_highest_gr
    )
  end
end
