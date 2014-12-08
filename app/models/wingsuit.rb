class Wingsuit < ActiveRecord::Base
  belongs_to :manufacturer

  has_many :tracks
  has_many :competitors

  def self.suggestions_by_name(query, event=nil)
    suggestions = []
    wingsuits = Wingsuit.where('LOWER(name) LIKE LOWER(?)', "%#{query}%")
    wingsuits.each { |x| suggestions << {:value => x.name, :category => x.manufacturer.name,:data => x.id } }
    suggestions
  end

end
