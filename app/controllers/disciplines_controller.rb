class DisciplinesController < ApplicationController
  before_action :set_discipline, only: [:show, :edit, :update, :destroy]

  def index
    @disciplines = Discipline.all
  end

  def show
  end

  def new
  end

  def create
    @discipline = Discipline.new(params[:discipline].permit(:name))

    @discipline.save
    redirect_to discipline_path(@discipline)
  end

  def update

  end

  def destroy

  end

  private
    def set_discipline
      @discipline = Discipline.find(params[:id])
    end

end
