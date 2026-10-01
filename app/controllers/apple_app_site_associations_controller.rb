class AppleAppSiteAssociationsController < ApplicationController
  APP_IDS = %w[RT5237MTWU.io.skyderby.app RT5237MTWU.io.skyderby.app.dev].freeze
  PATHS = %w[
    /tracks/*
    /events/*
    /virtual_competitions/*
    /profiles/*
    /places/*
    /suits/*
    /flight_profiles
    /terrain-profiles
  ].freeze

  def show
    render json: {
      applinks: {
        details: [{ appIDs: APP_IDS, components: PATHS.map { |path| { '/' => path } } }]
      }
    }
  end
end
