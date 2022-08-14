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
  include Popularity, Stats

  attr_accessor :photo

  enum kind: SuitTypes

  belongs_to :manufacturer

  has_many :tracks, -> { order('created_at DESC') }, inverse_of: :suit
  has_many :competitors, class_name: 'Event::Competitor', dependent: :restrict_with_error
  has_many :pilots, through: :tracks

  validates :name, presence: true
  validates :manufacturer, presence: true

  delegate :name, to: :manufacturer, prefix: true, allow_nil: true
  delegate :code, to: :manufacturer, prefix: true, allow_nil: true

  def pilots_accessible_by(user)
    Profile.where(id: tracks.unscope(:order)
                            .accessible_by(user)
                            .select(:profile_id)
                            .distinct)
  end

  class << self
    def search(query)
      return all if query.blank?

      joins(:manufacturer).where(
        'LOWER(suits.name) LIKE :query
         OR LOWER(manufacturers.name) LIKE :query',
        query: "%#{query.downcase}%"
      )
    end
  end
end
