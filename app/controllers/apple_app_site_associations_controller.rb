class AppleAppSiteAssociationsController < ApplicationController
  APP_IDS = %w[C54KA5H42F.io.skyderby.app].freeze
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
      },
      webcredentials: { apps: APP_IDS }
    }
  end
end
