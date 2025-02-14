module PerformanceCompetition::DesignatedLane
  extend ActiveSupport::Concern

  included do
    enum :designated_lane_start, { on_10_sec: 1, on_enter_window: 0 }, prefix: 'designated_lane_start'

    has_many :reference_points, foreign_key: :event_id, dependent: :delete_all

    accepts_nested_attributes_for :reference_points,
                                  allow_destroy: true,
                                  reject_if: ->(attrs) { attrs['name'].blank? }
  end
end
