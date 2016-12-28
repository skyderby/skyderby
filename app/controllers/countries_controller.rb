class CountriesController < ApplicationController
  load_and_authorize_resource

  before_action :set_country, only: [:show, :edit, :update, :destroy]
  after_action :expire_cache, only: [:create, :update, :destroy]

  def index
    @countries = Country.order(:name)
  end

  def show; end

  def new
    @country = Country.new
  end

  def edit; end

  def create
    @country = Country.new(country_params)

    if @country.save
      redirect_to @country, notice: 'Country was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    if @country.update(country_params)
      redirect_to @country, notice: 'Country was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    @country.destroy
    redirect_to countries_url
  end

  private

  def set_country
    @country = Country.find(params[:id])
  end

  def country_params
    params.require(:country).permit(:name, :code)
  end

  def expire_cache
    expire_fragment 'all_countries'
  end
end
