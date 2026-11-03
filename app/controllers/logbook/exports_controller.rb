require 'csv'

module Logbook
  class ExportsController < ApplicationController
    include LogbookScoped

    COLUMNS = %w[
      kind number jumped_at place suit equipment jump_type aircraft object_type wind_strength wind_direction
      exit_altitude deployment_altitude freefall_seconds canopy_seconds shared_with notes track_id
    ].freeze

    def show
      send_data csv, filename: "logbook-#{Date.current}.csv", type: 'text/csv'
    end

    private

    def csv
      CSV.generate do |rows|
        rows << COLUMNS
        logbook_profile.jumps.kept.includes(:place, :suit).order(:jumped_at, :id).each do |jump|
          rows << row_for(jump)
        end
      end
    end

    def row_for(jump)
      COLUMNS.map do |column|
        case column
        when 'place' then jump.place_label
        when 'suit' then jump.suit_name
        when 'jumped_at' then jump.jumped_at.iso8601
        else jump.public_send(column)
        end
      end
    end
  end
end
