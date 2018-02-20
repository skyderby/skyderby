# This model represent BASE exit line, path that basejumper can fly.
# Main purpose of creating this model was feature-request to make
# ability to store multiple exit measurements for one BASE exit.
class PlaceLine < ApplicationRecord
  belongs_to :place
  has_many :exit_measurements, dependent: :delete_all

  accepts_nested_attributes_for :exit_measurements

  validates :name, presence: true
end
