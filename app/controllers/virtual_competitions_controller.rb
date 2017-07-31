class VirtualCompetitionsController < ApplicationController
  before_action :set_competition, only: %i[show edit update]

  def index
    @competitions = VirtualCompetition.includes(:group, place: :country).group_by { |x| x.group.name }
  end

  def new
    @competition = VirtualCompetition.new
  end

  def show
    competition_path =
      if params[:year].present?
        virtual_competition_year_path(@competition, year: params[:year])
      elsif @competition.default_last_year?
        virtual_competition_year_path(@competition, year: @competition.last_year)
      else
        virtual_competition_overall_path(@competition)
      end

    redirect_to competition_path
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

  def show_params
    params.permit(:year, :overall)
  end
  helper_method :show_params

  def competition_params
    params.require(:virtual_competition).permit(
      :name,
      :virtual_comp_group_id,
      :period_from,
      :period_to,
      :place_id,
      :range_from,
      :range_to,
      :jumps_kind,
      :suits_kind,
      :discipline,
      :discipline_parameter,
      :display_on_start_page,
      :display_highest_speed,
      :display_highest_gr,
      :default_view
    )
  end
end
