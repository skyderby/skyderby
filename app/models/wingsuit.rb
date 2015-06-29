# == Schema Information
#
# Table name: wingsuits
#
#  id              :integer          not null, primary key
#  manufacturer_id :integer
#  ws_class_id     :integer
#  name            :string(255)
#  kind            :integer          default(0)
#

class Wingsuit < ActiveRecord::Base
  enum kind: [:wingsuit, :tracksuit]

  belongs_to :manufacturer

  has_many :tracks
  has_many :competitors

  validates :name, presence: true
  validates :manufacturer, presence: true

  class << self
    def search(query)
      joins(:manufacturer).where(
        'LOWER(wingsuits.name) LIKE :query OR LOWER(manufacturers.name) LIKE :query',
        query: "%#{query.downcase}%"
      )
    end
  end
end
