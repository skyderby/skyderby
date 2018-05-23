class VirtualCompetitionsController < ApplicationController
  before_action :set_competition, only: %i[show edit update destroy]

  def index
    authorize VirtualCompetition

    @competitions = VirtualCompetition.includes(:group, place: :country).group_by { |x| x.group.name }
  end

  def new
    authorize VirtualCompetition

    @competition = VirtualCompetition.new
  end

  def show
    authorize @competition

    competition_path =
      if params[:year].present?
        virtual_competition_year_path(@competition, year: params[:year])
      elsif @competition.annual?
        virtual_competition_year_path(@competition, year: @competition.last_year)
      elsif @competition.custom_intervals?
        virtual_competition_period_path(@competition, @competition.last_interval)
      end

    redirect_to competition_path
  end

  def edit
    authorize @competition
  end

  def create
    authorize :virtual_competition

    @competition = VirtualCompetition.new(competition_params)

    if @competition.save
      redirect_to @competition, notice: 'Competition was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    authorize @competition

    if @competition.update competition_params
      redirect_to @competition, notice: 'Данные успешно обновлены.'
    else
      redirect_to @competition, notice: 'При сохранении произошла ошибка.'
    end
  end

  def destroy
    authorize @competition

    @competition.destroy
    redirect_to virtual_competitions_path
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
      :group_id,
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
