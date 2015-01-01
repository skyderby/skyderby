class Section < ActiveRecord::Base
  belongs_to :event

  validates_presence_of :name
  validates_presence_of :event

  before_create :set_order

  def set_order
    sections = Section.where(:event_id => event_id).to_a
    self.order = (sections.map{ |x| x.order }.max || 0 ) + 1
  end
end
