class Manufacturer < ApplicationRecord
  has_many :suits, dependent: :restrict_with_error

  validates :name, presence: true
  validates :code, uniqueness: true

  def self.search(term)
    where('name ILIKE ?', "%#{term}%")
  end
end
