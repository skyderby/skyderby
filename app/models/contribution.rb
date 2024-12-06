class Contribution < ApplicationRecord
  has_many :details, dependent: :destroy
  has_many :profiles, through: :details

  accepts_nested_attributes_for :details, allow_destroy: true
end
