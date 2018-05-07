# This model represent BASE exit line, path that basejumper can fly.
# Main purpose of creating this model was feature-request to make
# ability to store multiple exit measurements for one BASE exit.
class PlaceLine < ApplicationRecord
  belongs_to :place, touch: true
  has_many :exit_measurements, dependent: :delete_all

  accepts_nested_attributes_for :exit_measurements,
                                allow_destroy: true,
                                reject_if: ->(attrs) { attrs['altitude'].blank? }

  validates :name, presence: true

  delegate :country_name, to: :place
  delegate :name, to: :place, prefix: true

  def full_name
    "#{place_name} - #{name}"
  end
end
