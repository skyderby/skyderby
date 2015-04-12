# encoding: utf-8
class WingsuitsController < ApplicationController
  before_action :set_wingsuit, only: [:show, :edit, :update, :destroy]
  
  def index
    authorize! :read, :wingsuit
    @wingsuits = Wingsuit
                  .includes(:manufacturer)
                  .order('manufacturers.name, kind, wingsuits.name')
                  .group_by { |x| x.manufacturer }
  end

  def show
    authorize! :read, @wingsuit
  end

  def new
    authorize! :create, :wingsuit
    @wingsuit = Wingsuit.new
  end

  def edit
    authorize! :update, @wingsuit
  end

  def create
    authorize! :create, :wingsuit
    @wingsuit = Wingsuit.new(wingsuit_params)

    if @wingsuit.save
      redirect_to @wingsuit, notice: 'Wingsuit was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    authorize! :update, @wingsuit
    if @wingsuit.update(wingsuit_params)
      redirect_to @wingsuit, notice: 'Wingsuit was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    authorize! :destroy, @wingsuit
    @wingsuit.destroy
    redirect_to wingsuits_url
  end

  private
  def set_wingsuit
    @wingsuit = Wingsuit.find(params[:id])
  end

  def wingsuit_params
    params.require(:wingsuit).permit(:name, :manufacturer_id)
  end
end
