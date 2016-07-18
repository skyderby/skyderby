class CountriesController < ApplicationController
  load_and_authorize_resource

  before_action :set_country, only: [:show, :edit, :update, :destroy]

  def index
    @countries = Country.order(:name)

    @countries = @countries.search(params[:query][:term]) if params[:query] && params[:query][:term]
  end

  def show
  end

  def new
    @country = Country.new
  end

  def edit
  end

  def create
    @country = Country.new(country_params)

    if @country.save
      redirect_to @country, notice: 'Country was successfully created.'
      expire_fragment 'all_countries'
    else
      render action: 'new'
    end
  end

  def update
    if @country.update(country_params)
      expire_fragment 'all_countries'
      redirect_to @country, notice: 'Country was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    @country.destroy
      expire_fragment 'all_countries'
    redirect_to countries_url
  end

  private

  def set_country
    @country = Country.find(params[:id])
  end

  def country_params
    params.require(:country).permit(:name, :code)
  end
end
