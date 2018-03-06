# == Schema Information
#
# Table name: countries
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

class Country < ApplicationRecord
  has_many :places, dependent: :restrict_with_error
  has_many :profiles, dependent: :restrict_with_error

  validates :name, presence: true
  validates :code, uniqueness: true

  class << self
    def search(query)
      return all if query.blank?

      where('LOWER(name) LIKE LOWER(?)', "%#{query}%")
    end
  end
end
