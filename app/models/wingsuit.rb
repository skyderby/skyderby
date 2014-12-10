class Wingsuit < ActiveRecord::Base
  belongs_to :manufacturer

  has_many :tracks
  has_many :competitors

  def self.suggestions_by_name(query)
    Wingsuit.includes(:manufacturer).where('LOWER(name) LIKE LOWER(?)', "%#{query}%").to_a
        .map { |x| {:value => x.name, :data => {:category => x.manufacturer.name,:id => x.id }} }
  end

end
