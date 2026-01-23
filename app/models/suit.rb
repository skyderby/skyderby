# == Schema Information
#
# Table name: suits
#
#  id                 :integer          not null, primary key
#  manufacturer_id    :integer
#  name               :string(510)
#  kind               :integer          default("wingsuit")
#  description        :text
#

class Suit < ApplicationRecord
  attr_accessor :photo

  enum :kind, SuitTypes

  belongs_to :manufacturer

  has_many :tracks, -> { order(created_at: :desc) }, inverse_of: :suit, dependent: :nullify
  has_many :competitors, dependent: :restrict_with_error
  has_many :pilots, through: :tracks

  validates :name, presence: true

  delegate :name, to: :manufacturer, prefix: true, allow_nil: true
  delegate :code, to: :manufacturer, prefix: true, allow_nil: true

  def accessible_profiles
    Profile.where(id: tracks.unscope(:order).accessible.select(:profile_id).distinct)
  end

  class << self
    def search(query)
      return all if query.blank?

      joins(:manufacturer).where(
        'unaccent(suits.name) ILIKE unaccent(:query)
         OR unaccent(manufacturers.name) ILIKE unaccent(:query)',
        query: "%#{query}%"
      )
    end
  end
end
