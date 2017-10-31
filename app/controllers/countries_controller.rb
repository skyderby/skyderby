class CountriesController < ApplicationController
  before_action :set_country, only: [:show, :edit, :update, :destroy]
  after_action :expire_cache, only: [:create, :update, :destroy]

  def index
    authorize Country

    @countries = Countries::Index.new
  end

  def show
    authorize @country
  end

  def new
    authorize Country

    @country = Country.new
  end

  def edit
    authorize @country
  end

  def create
    authorize Country

    @country = Country.new(country_params)

    if @country.save
      redirect_to @country, notice: 'Country was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    authorize @country

    if @country.update(country_params)
      redirect_to @country, notice: 'Country was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    authorize @country

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
