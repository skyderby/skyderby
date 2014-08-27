class Wingsuit < ActiveRecord::Base
  belongs_to :manufacturer
  belongs_to :ws_class
  has_many :user_wingsuits
  has_many :users, :through => :user_wingsuits

  def self.suggestions_by_name query
    suggestions = []
    wingsuits = Wingsuit.where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
    wingsuits.each do |x|
      suggestions << {:value => x.name, :category => x.manufacturer.name , :ws_class => x.ws_class.name, :data => x.id}
    end
    suggestions
  end

end
