class CountriesController < ApplicationController
  before_action :set_country, only: [:show, :edit, :update, :destroy]

  def index
    authorize! :read, :country
    @countries = Country.order(:name)
  end

  def show
    authorize! :read, :country
  end

  def new
    authorize! :create, :country
    @country = Country.new
  end

  def edit
    authorize! :update, @country
  end

  def create
    authorize! :create, :country
    @country = Country.new(country_params)

    if @country.save
      redirect_to @country, notice: 'Country was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    authorize! :update, @country

    if @country.update(country_params)
      redirect_to @country, notice: 'Country was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    authorize! :destroy, @country
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
end
