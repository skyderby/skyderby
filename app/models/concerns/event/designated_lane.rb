class Event < ApplicationRecord
  module DesignatedLane
    extend ActiveSupport::Concern

    included do
      enum designated_lane_start: %i[designated_lane_start_on_enter_window designated_lane_start_on_10_sec]

      has_many :reference_points, dependent: :delete_all

      accepts_nested_attributes_for :reference_points,
                                    allow_destroy: true,
                                    reject_if: ->(attrs) { attrs['name'].blank? }
    end
  end
end
