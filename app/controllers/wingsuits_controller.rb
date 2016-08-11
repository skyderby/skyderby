# encoding: utf-8
class WingsuitsController < ApplicationController
  before_action :set_wingsuit, only: [:show, :edit, :update, :destroy]

  load_and_authorize_resource

  def index
    @wingsuits = 
      Wingsuit.includes(:manufacturer)
              .select('wingsuits.id, wingsuits.name, wingsuits.kind, manufacturer_id, manufacturers.name manufacturer_name') 
              .order('manufacturers.name, kind, wingsuits.name')

    if params[:query] && params[:query][:term]
      @wingsuits = @wingsuits.search(params[:query][:term]) if params[:query][:term]
    end

    respond_to do |format|
      format.html { @wingsuits = @wingsuits.group_by(&:manufacturer_name) }
      format.json { @wingsuits }
    end
  end

  def show
  end

  def new
    @wingsuit = Wingsuit.new
  end

  def edit
  end

  def create
    @wingsuit = Wingsuit.new(wingsuit_params)

    if @wingsuit.save
      redirect_to @wingsuit, notice: 'Wingsuit was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    if @wingsuit.update(wingsuit_params)
      redirect_to @wingsuit, notice: 'Wingsuit was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    @wingsuit.destroy
    redirect_to wingsuits_url
  end

  private

  def set_wingsuit
    @wingsuit = Wingsuit.find(params[:id])
  end

  def wingsuit_params
    params.require(:wingsuit).permit(
      :name,
      :manufacturer_id,
      :kind,
      :photo,
      :description)
  end
end
