class TournamentsController < ApplicationController
  before_action :set_tournament, only: [:show, :edit, :update, :destroy]

  load_and_authorize_resource

  def index
    @tournaments = Tournament.order('id DESC')
  end

  def show
  end

  def new
    @tournament = Tournament.new
  end

  def edit
  end

  def create
    @tournament = Tournament.new(tournament_params)

    if @tournament.save
      redirect_to @tournament, notice: 'Tournament was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    if @tournament.update(tournament_params)
      redirect_to @tournament, notice: 'Tournament was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
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
      :finish_start_lat,
      :finish_start_lon,
      :finish_end_lat,
      :finish_end_lon,
      :starts_at,
      :exit_lat,
      :exit_lon
    )
  end
end
