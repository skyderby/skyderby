class VirtualCompetition < ApplicationRecord
  module Intervals
    extend ActiveSupport::Concern

    included do
      enum interval_type: { annual: 0, custom_intervals: 1 }

      has_many :custom_intervals, -> { order(:period_to) }, inverse_of: :virtual_competition, dependent: :destroy
    end

    def years
      (period_from.year..last_year).to_a
    end

    def last_year
      [period_to.year, Date.current.year].min
    end

    def intervals
      custom_intervals.until(Time.current)
    end

    def last_interval
      intervals.last
    end
  end
end
