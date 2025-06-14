class Event::Team < ApplicationRecord
  include Event::Namespace

  has_many :competitors, dependent: :nullify

  scope :ordered, -> { order(:name) }

  validates :name, presence: true
end
