# encoding: utf-8
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
    @discipline = Discipline.new(discipline_params)

    if @discipline.save
      redirect_to @discipline
    else
      render 'new'
    end
  end

  def update
  end

  def destroy
  end

  private

  def set_discipline
    @discipline = Discipline.find(params[:id])
  end

  def discipline_params
    params[:discipline].permit(:name)
  end

end
