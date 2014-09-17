class Wingsuit < ActiveRecord::Base
  belongs_to :manufacturer
  belongs_to :ws_class
  has_many :user_wingsuits
  has_many :users, :through => :user_wingsuits
  has_many :competitors

  def self.suggestions_by_name(query, event=nil)

    allow_tracksuits = event.nil? || event.allow_tracksuits
    merge_rookie = event.present? && event.merge_intermediate_and_rookie

    suggestions = []
    wingsuits = Wingsuit.where('LOWER(name) LIKE LOWER(?)', "%#{query}%")
    wingsuits.each do |x|
      ws_class = x.ws_class.name.downcase.to_sym
      ws_class = :intermediate if ws_class == :rookie && merge_rookie
      unless ws_class == :tracksuit && !allow_tracksuits
        suggestions << {:value => x.name, :category => x.manufacturer.name,
                        :ws_class => ws_class.to_s.capitalize, :data => x.id}
      end
    end
    suggestions
  end

end
