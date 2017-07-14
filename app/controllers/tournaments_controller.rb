class TournamentsController < ApplicationController
  before_action :set_tournament, only: [:show, :edit, :update, :destroy]

  def index
    authorize Tournament
    @tournaments = Tournament.order('id DESC')
  end

  def show
    authorize @tournament
    if !policy(@tournament).update? && @tournament.rounds.count.zero?
      redirect_to tournament_qualification_path(@tournament)
    end
  end

  def new
    authorize Tournament
    @tournament = Tournament.new
  end

  def edit
    authorize @tournament
  end

  def create
    authorize Tournament
    @tournament = Tournament.new(tournament_params)

    if @tournament.save
      redirect_to @tournament, notice: 'Tournament was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    authorize @tournament

    if @tournament.update(tournament_params)
      redirect_to @tournament, notice: 'Tournament was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    authorize @tournament

    @tournament.destroy
    redirect_to tournaments_path
  end

  private

  def set_tournament
    @tournament = Tournament.find(params[:id])
  end

  def tournament_params
    params.require(:tournament).permit(
      :name,
      :place_id,
      :finish_start_lat,
      :finish_start_lon,
      :finish_end_lat,
      :finish_end_lon,
      :starts_at,
      :exit_lat,
      :exit_lon,
      :bracket_size,
      :has_qualification
    )
  end
end
